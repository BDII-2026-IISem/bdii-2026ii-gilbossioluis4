import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  username?: string;
  password?: string;
}

export interface SessionUser {
  id?: number;
  username: string;
  email?: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/auth`;

  readonly currentUser = signal<SessionUser | null>(null);

  login(credentials: LoginRequest): Observable<any> {
    return this.http.post<{ access: string; refresh: string }>(`${this.base}/login/`, credentials).pipe(
      tap((res) => {
        if (res.access) localStorage.setItem('access_token', res.access);
        if (res.refresh) localStorage.setItem('refresh_token', res.refresh);
        this.currentUser.set({ username: credentials.username || 'admin' });
      })
    );
  }

  refresh(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return throwError(() => new Error('No refresh token'));

    return this.http.post<{ access: string }>(`${this.base}/refresh/`, { refresh: refreshToken }).pipe(
      tap((res) => {
        if (res.access) localStorage.setItem('access_token', res.access);
      })
    );
  }

  me(): Observable<SessionUser | null> {
    const token = localStorage.getItem('access_token');
    if (!token) return of(null);

    const user: SessionUser = this.currentUser() || { username: 'admin' };
    this.currentUser.set(user);
    return of(user);
  }

  logout(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUser.set(null);

    if (refreshToken) {
      return this.http.post(`${this.base}/logout/`, { refresh: refreshToken }).pipe(
        catchError(() => of(null))
      );
    }
    return of(null);
  }
}
