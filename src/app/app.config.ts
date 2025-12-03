import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './app.routes';

// --- IMPORTANTE: Importar el interceptor aquí ---
import { authInterceptor } from './shared/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation()),
    
    // --- CORRECCIÓN AQUÍ ---
    // Usamos paréntesis (), no dos puntos :
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    provideAnimations(),
    importProvidersFrom(ReactiveFormsModule),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideCharts(withDefaultRegisterables())
  ]
};