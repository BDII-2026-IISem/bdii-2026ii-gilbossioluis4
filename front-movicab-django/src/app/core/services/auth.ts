import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EffectivePermission, LoginRequest, ProfileUpdatePayload, SessionUser, TokenPair } from '../models/auth.model';
import { SessionStore } from './session-store';

interface LoginResponse {
  access: string;
  refresh: string;
  token_type: 'Bearer';
  access_expires_in: number;
}

interface PermissionResponse {
  permissions: EffectivePermission[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionStore);
  private readonly base = `${environment.apiUrl}/auth`;

  readonly currentUser = signal<SessionUser | null>(null);

  login(credentials: LoginRequest): Observable<SessionUser> {
    return this.http.post<LoginResponse>(`${this.base}/login/`, credentials).pipe(
      tap((response) => this.session.setTokens(this.tokenPair(response))),
      switchMap(() => this.me()),
      tap((user) => this.currentUser.set(user)),
      catchError((error: unknown) => {
        this.session.clear();
        this.currentUser.set(null);
        return throwError(() => error);
      }),
    );
  }

  refresh(): Observable<TokenPair> {
    const refreshToken = this.session.refreshToken();
    if (!refreshToken) return throwError(() => new Error('No refresh token'));

    return this.http.post<LoginResponse>(`${this.base}/refresh/`, { refresh: refreshToken }).pipe(
      map((response) => this.tokenPair(response)),
      tap((tokens) => this.session.setTokens(tokens)),
    );
  }

  me(): Observable<SessionUser> {
    return forkJoin({
      user: this.http.get<SessionUser>(`${this.base}/profile/`),
      response: this.http.get<PermissionResponse>(`${this.base}/permissions/`),
    }).pipe(
      map(({ user, response }) => ({ user, permissions: response.permissions })),
      tap(({ user, permissions }) => {
        this.session.setUser(user, permissions);
        this.currentUser.set(user);
      }),
      map(({ user }) => user),
    );
  }

  updateProfile(payload: ProfileUpdatePayload): Observable<SessionUser> {
    return this.http.patch<SessionUser>(`${this.base}/profile/`, payload).pipe(
      tap((user) => {
        this.session.setUser(user, this.session.permissions());
        this.currentUser.set(user);
      }),
    );
  }

  logout(): Observable<void> {
    const refreshToken = this.session.refreshToken();
    this.session.clear();
    this.currentUser.set(null);

    if (refreshToken) {
      return this.http.post<void>(`${this.base}/logout/`, { refresh: refreshToken });
    }
    return of(undefined);
  }

  private tokenPair(response: LoginResponse): TokenPair {
    return {
      access: response.access,
      refresh: response.refresh,
      tokenType: response.token_type,
      accessExpiresIn: response.access_expires_in,
    };
  }
}
