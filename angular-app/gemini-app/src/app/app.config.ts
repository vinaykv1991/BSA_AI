import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';

// ngx-highlightjs configuration
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(), // Required for Angular Material animations

    // Provide HIGHLIGHT_OPTIONS for ngx-highlightjs
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        // lineNumbersLoader: () => import('ngx-highlightjs/line-numbers'), // Optional
        languages: {
          typescript: () => import('highlight.js/lib/languages/typescript'),
          javascript: () => import('highlight.js/lib/languages/javascript'),
          python: () => import('highlight.js/lib/languages/python'),
          xml: () => import('highlight.js/lib/languages/xml'),      // For HTML
          css: () => import('highlight.js/lib/languages/css'),
          scss: () => import('highlight.js/lib/languages/scss'),
          json: () => import('highlight.js/lib/languages/json'),
          bash: () => import('highlight.js/lib/languages/bash'),     // For shell/bash
          markdown: () => import('highlight.js/lib/languages/markdown'),
          // Add more languages as needed
        },
        // Optional: theme path or custom theme
        // themePath: 'path-to-your-custom-hljs-theme.css'
        // Example: themePath: 'node_modules/highlight.js/styles/atom-one-dark.css'
        // If not set, you'll need to include a theme CSS manually in styles.scss or angular.json
      }
    }
  ]
};
