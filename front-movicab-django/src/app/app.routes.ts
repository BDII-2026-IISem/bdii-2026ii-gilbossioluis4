import { Routes } from '@angular/router';
import { adminRoleGuard, authGuard, guestGuard, permissionGuard } from './core/guards/auth.guard';
import { DOMAIN_DEFINITIONS } from './features/domain/domain-config';

const ADMIN_DOMAIN_PATHS = new Set([
  'users',
  'roles',
  'role-users',
  'resources',
  'resource-roles',
  'user-resource-permissions',
]);

const domainRoutes: Routes = Object.entries(DOMAIN_DEFINITIONS)
  .filter(([path]) => path !== 'usuarios')
  .map(([path, domain]) => ({
    path,
    title: `${domain.title} · MoviCab`,
    canActivate: ADMIN_DOMAIN_PATHS.has(domain.path)
      ? [adminRoleGuard, permissionGuard]
      : [permissionGuard],
    data: { domain, permission: `GET /api/${domain.path}/` },
    loadComponent: () => import('./features/domain/domain-page').then((module) => module.DomainPage),
  }));

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión · MoviCab',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'pasajeros' },
      {
        path: 'forbidden',
        title: 'Acceso denegado · MoviCab',
        loadComponent: () =>
          import('./features/auth/forbidden/forbidden').then((m) => m.Forbidden),
      },
      ...domainRoutes,
      {
        path: 'usuarios',
        title: 'Usuarios y permisos · MoviCab',
        canActivate: [adminRoleGuard, permissionGuard],
        data: { permission: 'GET /api/users/' },
        loadComponent: () => import('./features/security/security-admin').then((m) => m.SecurityAdmin),
      },
      {
        path: 'perfil',
        title: 'Mi sesión · MoviCab',
        loadComponent: () =>
          import('./features/auth/profile/profile').then((m) => m.Profile),
      },
    ],
  },
  { path: '**', redirectTo: 'pasajeros' },
];
