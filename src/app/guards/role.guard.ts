import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles: string[] = route.data['roles'] || [];

  const tienePermiso = requiredRoles.some((r) => authService.hasRole(r));
  if (!tienePermiso) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};
