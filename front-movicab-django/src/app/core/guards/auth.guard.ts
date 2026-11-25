import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SessionStore } from '../services/session-store';

export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionStore);
  const router = inject(Router);
  return session.isAuthenticated()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const guestGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  const router = inject(Router);
  return session.isAuthenticated() ? router.createUrlTree(['/pasajeros']) : true;
};

export const permissionGuard: CanActivateFn = (route) => {
  const session = inject(SessionStore);
  const router = inject(Router);
  const permission = route.data['permission'];
  return typeof permission === 'string' && session.canPermission(permission)
    ? true
    : router.createUrlTree(['/forbidden'], {
      queryParams: typeof permission === 'string' ? { permission } : undefined,
    });
};

export const adminRoleGuard: CanActivateFn = () => {
    const session = inject(SessionStore);
    const router = inject(Router);
    return session.roles().some((role) => role.toUpperCase() === 'ADMIN')
      ? true
      : router.createUrlTree(['/forbidden']);
};
