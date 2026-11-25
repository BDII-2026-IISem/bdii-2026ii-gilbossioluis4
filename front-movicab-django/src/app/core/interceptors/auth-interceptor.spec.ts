import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { TokenPair } from '../models/auth.model';
import { SessionStore } from '../services/session-store';
import { ClientApi } from '../../features/clients/client-api';
import { authInterceptor } from './auth-interceptor';

const PAR: TokenPair = { access: 'a1', refresh: 'r1', tokenType: 'Bearer', accessExpiresIn: 3600 };

describe('authInterceptor', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        MessageService,
      ],
    });
  });

  it('should attach Bearer and refresh only once for two 401', () => {
    const store = TestBed.inject(SessionStore);
    store.setTokens({ ...PAR, access: 'viejo' });

    const api = TestBed.inject(ClientApi);
    const http = TestBed.inject(HttpTestingController);

    api.list().subscribe();
    api.list().subscribe();

    const original = http.match('http://localhost:8000/api/clients/');
    expect(original.length).toBe(2);
    expect(original[0].request.headers.get('Authorization')).toBe('Bearer viejo');

    original[0].flush({ detail: 'vencido' }, { status: 401, statusText: 'Unauthorized' });
    original[1].flush({ detail: 'vencido' }, { status: 401, statusText: 'Unauthorized' });

    const refresh = http.expectOne('http://localhost:8000/api/auth/refresh/');
    expect(refresh.request.body).toEqual({ refresh: 'r1' });

    refresh.flush({
      access: 'nuevo',
      refresh: 'r2',
      token_type: 'Bearer',
      access_expires_in: 3600,
    });

    const retried = http.match('http://localhost:8000/api/clients/');
    expect(retried.length).toBe(2);
    retried.forEach((r) => {
      expect(r.request.headers.get('Authorization')).toBe('Bearer nuevo');
      r.flush([]);
    });

    http.verify();
  }, 15000);
});
