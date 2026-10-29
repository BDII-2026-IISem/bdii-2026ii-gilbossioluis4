import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EffectivePermission, SessionUser, TokenPair } from '../models/auth.model';
import { SessionStore } from './session-store';

const PAR: TokenPair = { access: 'a1', refresh: 'r1', tokenType: 'Bearer', accessExpiresIn: 3600 };
const USER: SessionUser = { id: 1, username: 'admin', email: 'admin@movicab.test', avatar: null, status: 'active' };
const PERMISO: EffectivePermission = { method: 'GET', path: '/api/clients', roleId: 1, roleName: 'ADMIN' };

describe('SessionStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('should match :id, ignore the trailing slash and restore the session', () => {
    const store = TestBed.inject(SessionStore);
    store.setTokens(PAR);
    store.setUser(USER, [PERMISO, { ...PERMISO, method: 'PATCH', path: '/api/clients/:id' }]);

    expect(store.canPermission('GET /api/clients')).toBe(true);
    expect(store.canPermission('PATCH /api/clients/7')).toBe(true);
    expect(store.canPermission('DELETE /api/clients/7')).toBe(false);
    expect(store.roles()).toEqual(['ADMIN']);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    const restoredStore = TestBed.inject(SessionStore);
    expect(restoredStore.canPermission('GET /api/clients')).toBe(true);
  });
});
