import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EffectivePermission, SessionUser } from '../models/auth.model';
import { SessionStore } from './session-store';
import { AuthService } from './auth';

const PAR = { access: 'a1', refresh: 'r1', token_type: 'Bearer', access_expires_in: 3600 };
const USER: SessionUser = { id: 1, username: 'admin', email: 'admin@movicab.test', avatar: null, status: 'active' };
const PERMISO: EffectivePermission = { method: 'GET', path: '/api/clients', roleId: 1, roleName: 'ADMIN' };

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('should store the pair and only then load profile and permissions', () => {
    const http = TestBed.inject(HttpTestingController);
    let emitted: SessionUser | undefined;

    TestBed.inject(AuthService)
      .login({ username: 'admin', password: 'Admin123!' })
      .subscribe((u) => (emitted = u));

    const login = http.expectOne('http://localhost:8000/api/auth/login/');
    login.flush(PAR);

    expect(TestBed.inject(SessionStore).accessToken()).toBe('a1');
    expect(emitted).toBeUndefined();

    http.expectOne('http://localhost:8000/api/auth/profile/').flush(USER);
    http.expectOne('http://localhost:8000/api/auth/permissions/').flush({ permissions: [PERMISO] });

    expect(emitted).toEqual(USER);
    http.verify();
  });
});
