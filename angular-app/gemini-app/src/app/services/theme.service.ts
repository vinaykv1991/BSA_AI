import { Injectable, Renderer2, RendererFactory2, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private currentThemeSubject = new BehaviorSubject<Theme>('system'); // Default to system
  public currentTheme$ = this.currentThemeSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    rendererFactory: RendererFactory2,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.renderer = rendererFactory.createRenderer(null, null);

    if (this.isBrowser) {
      this.loadTheme();
    } else {
      // Default to light theme for SSR/prerender if needed, or handle differently
      this.applyTheme('light'); // Apply light theme on server to avoid undefined body class
    }
  }

  private loadTheme() {
    const savedTheme = localStorage.getItem('novagem-theme') as Theme | null;
    if (savedTheme) {
      this.setTheme(savedTheme, false); // Don't save again if loaded
    } else {
      this.setTheme('system', true); // Default to system and try to match system preference
    }
  }

  setTheme(theme: Theme, savePreference: boolean = true): void {
    if (!this.isBrowser) {
      // On server, just store preference if needed, but don't manipulate document.body
      // Or, if rendering for specific theme, apply it differently (not relevant here yet)
      this.currentThemeSubject.next(theme);
      if (savePreference && typeof localStorage !== 'undefined') { // Should not happen on server
         localStorage.setItem('novagem-theme', theme);
      }
      return;
    }

    let effectiveTheme: 'light' | 'dark';

    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      effectiveTheme = theme;
    }

    this.currentThemeSubject.next(theme); // Store the user's actual preference (light, dark, system)

    // Remove previous theme class if any
    this.renderer.removeClass(document.body, 'novagem-dark-theme');
    // No need for novagem-light-theme class as light is default without dark class

    if (effectiveTheme === 'dark') {
      this.renderer.addClass(document.body, 'novagem-dark-theme');
    }
    // If light, no class is needed as per current SCSS (absence of .novagem-dark-theme implies light)

    if (savePreference) {
      localStorage.setItem('novagem-theme', theme);
    }
  }

  // Helper to apply the theme directly (used internally by loadTheme/constructor for initial set)
  private applyTheme(themeToApply: 'light' | 'dark'): void {
    if (!this.isBrowser) return;

    this.renderer.removeClass(document.body, 'novagem-dark-theme');
    if (themeToApply === 'dark') {
      this.renderer.addClass(document.body, 'novagem-dark-theme');
    }
  }

  // Optional: Add a listener for system theme changes if current theme is 'system'
  // This requires more advanced setup with fromEvent or matchMedia.addListener
  // For now, 'system' is checked on load and when explicitly set.
}
