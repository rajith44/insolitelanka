import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { IMAGE_CONFIG } from '@angular/common';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { noCacheApiInterceptor } from './interceptors/no-cache-api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),
    provideHttpClient(withFetch(), withInterceptors([noCacheApiInterceptor])),
    provideClientHydration(withEventReplay()),
    // Disable NG0913: logo.png is displayed small (e.g. max-height: 60px) but file may be larger
    { provide: IMAGE_CONFIG, useValue: { disableImageSizeWarning: true } }
  ]
};
