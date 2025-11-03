import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const AuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  if (!auth.isLoggedIn()) {
    // Guardamos la ruta a la que el usuario intentó acceder
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  return true;
};
