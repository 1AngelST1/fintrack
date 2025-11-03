import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const PublicGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  // Si ya está logueado, redirigir al dashboard
  if (auth.isLoggedIn()) {
    router.navigate(['/dashboard']);
    return false;
  }
  
  return true;
};
