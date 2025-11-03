import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.getCurrentUser();

  const allowedRoles: string[] = route.data?.['roles'] ?? [];

  if (!user) {
    // Si no hay usuario, enviar al login (AuthGuard debería manejar esto primero)
    router.navigate(['/auth/login']);
    return false;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.rol)) {
    // Redirigir a dashboard y mostrar mensaje de no autorizado
    router.navigate(['/dashboard'], { queryParams: { unauthorized: true } });
    return false;
  }

  return true;
};
