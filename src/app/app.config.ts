import { ApplicationConfig, importProvidersFrom, APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEsCL from '@angular/common/locales/es-CL';
import {
  MsalModule,
  MsalService,
  MsalGuard,
  MsalBroadcastService,
  MsalInterceptor,
  MSAL_INSTANCE,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG
} from '@azure/msal-angular';
import { IPublicClientApplication } from '@azure/msal-browser';

import { routes } from './app.routes';
import { msalInstanceFactory } from './msal-config';
import { msalGuardConfigFactory } from './msal-guard-config';
import { msalInterceptorConfigFactory } from './msal-interceptor-config';

registerLocaleData(localeEsCL, 'es-CL');

export function initializeMsal(msalInstance: IPublicClientApplication) {
  return () => msalInstance.initialize();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(MsalModule),
    {
      provide: MSAL_INSTANCE,
      useFactory: msalInstanceFactory
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeMsal,
      deps: [MSAL_INSTANCE],
      multi: true
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: msalGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: msalInterceptorConfigFactory
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    {
      provide: LOCALE_ID,
      useValue: 'es-CL'
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService
  ]
};

