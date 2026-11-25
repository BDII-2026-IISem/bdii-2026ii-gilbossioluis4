import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { SessionStore } from '../services/session-store';
import { authGuard, guestGuard, permissionGuard } from './auth.guard';

function run(
  guard: CanActivateFn,
  url: string,
  authenticated: boolean,
  allowedPermission?: string,
  data: Record<string, unknown> = {},
): boolean | UrlTree {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: SessionStore,
        useValue: {
          isAuthenticated: () => authenticated,
          canPermission: (permission: string) => permission === allowedPermission,
        },
      },
    ],
  });
  return TestBed.runInInjectionContext(() =>
    guard(
      { data } as unknown as ActivatedRouteSnapshot,
      { url } as RouterStateSnapshot,
    ),
  ) as boolean | UrlTree;
}

describe('guards de autenticación y permisos', () => {
  it('authGuard redirige al login conservando la URL solicitada', () => {
    const result = run(authGuard, '/pasajeros', false);
    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree))
      .toBe('/login?returnUrl=%2Fpasajeros');
  });

  it('guestGuard devuelve al inicio cuando ya existe una sesión', () => {
    const result = run(guestGuard, '/login', true);
    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/pasajeros');
  });

  it('permissionGuard permite la concesión solicitada', () => {
    const permission = 'GET /api/pasajeros/';
    expect(run(permissionGuard, '/pasajeros', true, permission, { permission })).toBe(true);
  });

  it('permissionGuard redirige con el permiso faltante', () => {
    const permission = 'GET /api/pasajeros/';
    const denied = run(permissionGuard, '/pasajeros', true, undefined, { permission });
    expect(denied).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(denied as UrlTree))
      .toBe('/forbidden?permission=GET%20%2Fapi%2Fpasajeros%2F');
  });
});
