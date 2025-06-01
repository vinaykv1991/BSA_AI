import { TestBed } from '@angular/core/testing';
import { Renderer2, RendererFactory2, PLATFORM_ID } from '@angular/core';
import { ThemeService, Theme } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let rendererMock: any;
  let rendererFactoryMock: any;
  let mockLocalStorage: { [key: string]: string };

  const mockMatchMedia = (matches: boolean) => () => ({
    matches: matches,
    addListener: () => {},
    removeListener: () => {},
  });

  beforeEach(() => {
    mockLocalStorage = {};
    rendererMock = {
      addClass: jasmine.createSpy('addClass'),
      removeClass: jasmine.createSpy('removeClass'),
    };
    rendererFactoryMock = {
      createRenderer: () => rendererMock,
    };

    spyOn(localStorage, 'getItem').and.callFake((key) => mockLocalStorage[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key, value) => (mockLocalStorage[key] = value));
    spyOn(localStorage, 'removeItem').and.callFake((key) => delete mockLocalStorage[key]);

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: RendererFactory2, useValue: rendererFactoryMock },
        { provide: PLATFORM_ID, useValue: 'browser' }, // Simulate browser environment
      ],
    });
  });

  it('should be created', () => {
    service = TestBed.inject(ThemeService);
    expect(service).toBeTruthy();
  });

  it('should initialize with light theme if no saved theme and system is light', () => {
    (window as any).matchMedia = jasmine.createSpy().and.returnValue(mockMatchMedia(false)());
    service = TestBed.inject(ThemeService); // Re-inject to trigger constructor logic
    expect(rendererMock.removeClass).toHaveBeenCalledWith(document.body, 'novagem-dark-theme');
    expect(rendererMock.addClass).not.toHaveBeenCalledWith(document.body, 'novagem-dark-theme');
    service.currentTheme$.subscribe(theme => expect(theme).toBe('system')); // Initially system, resolves to light
  });

  it('should initialize with dark theme if no saved theme and system is dark', () => {
    (window as any).matchMedia = jasmine.createSpy().and.returnValue(mockMatchMedia(true)());
    service = TestBed.inject(ThemeService);
    expect(rendererMock.addClass).toHaveBeenCalledWith(document.body, 'novagem-dark-theme');
    service.currentTheme$.subscribe(theme => expect(theme).toBe('system')); // Initially system, resolves to dark
  });

  it('should load and apply saved theme from localStorage', () => {
    mockLocalStorage['novagem-theme'] = 'dark';
    service = TestBed.inject(ThemeService);
    expect(rendererMock.addClass).toHaveBeenCalledWith(document.body, 'novagem-dark-theme');
    service.currentTheme$.subscribe(theme => expect(theme).toBe('dark'));
  });

  it('setTheme("dark") should apply dark theme and save to localStorage', () => {
    service = TestBed.inject(ThemeService); // Ensure service is created
    service.setTheme('dark');
    expect(rendererMock.addClass).toHaveBeenCalledWith(document.body, 'novagem-dark-theme');
    expect(mockLocalStorage['novagem-theme']).toBe('dark');
    service.currentTheme$.subscribe(theme => expect(theme).toBe('dark'));
  });

  it('setTheme("light") should apply light theme and save to localStorage', () => {
    service = TestBed.inject(ThemeService);
    // First set to dark, then to light
    service.setTheme('dark');
    rendererMock.addClass.calls.reset(); // Reset spy for the next check
    rendererMock.removeClass.calls.reset();

    service.setTheme('light');
    expect(rendererMock.removeClass).toHaveBeenCalledWith(document.body, 'novagem-dark-theme');
    expect(rendererMock.addClass).not.toHaveBeenCalledWith(document.body, 'novagem-dark-theme');
    expect(mockLocalStorage['novagem-theme']).toBe('light');
    service.currentTheme$.subscribe(theme => expect(theme).toBe('light'));
  });

  it('setTheme("system") should apply system theme (light) and save "system" to localStorage', () => {
    (window as any).matchMedia = jasmine.createSpy().and.returnValue(mockMatchMedia(false)()); // System is light
    service = TestBed.inject(ThemeService);
    service.setTheme('system');
    expect(rendererMock.removeClass).toHaveBeenCalledWith(document.body, 'novagem-dark-theme');
    expect(rendererMock.addClass).not.toHaveBeenCalledWith(document.body, 'novagem-dark-theme');
    expect(mockLocalStorage['novagem-theme']).toBe('system');
    service.currentTheme$.subscribe(theme => expect(theme).toBe('system'));
  });

  it('setTheme("system") should apply system theme (dark) and save "system" to localStorage', () => {
    (window as any).matchMedia = jasmine.createSpy().and.returnValue(mockMatchMedia(true)()); // System is dark
    service = TestBed.inject(ThemeService);
    service.setTheme('system');
    expect(rendererMock.addClass).toHaveBeenCalledWith(document.body, 'novagem-dark-theme');
    expect(mockLocalStorage['novagem-theme']).toBe('system');
    service.currentTheme$.subscribe(theme => expect(theme).toBe('system'));
  });

  // Test PLATFORM_ID non-browser scenario
  it('should not call renderer methods if not in browser platform', () => {
    TestBed.resetTestingModule(); // Reset to change provider
    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: RendererFactory2, useValue: rendererFactoryMock },
        { provide: PLATFORM_ID, useValue: 'server' }, // Simulate server environment
      ],
    });
    service = TestBed.inject(ThemeService);
    service.setTheme('dark');
    expect(rendererMock.addClass).not.toHaveBeenCalled();
    expect(rendererMock.removeClass).not.toHaveBeenCalled();
  });

});
