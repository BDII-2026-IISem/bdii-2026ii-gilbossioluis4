import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionStore } from './session.store';
import { User, UserPayload, EffectivePermission } from '../models/user.model';
import { SILENT_ERRORS_HEADER } from '../utils/http';

interface LoginResponse {
  access: string;
  refresh: string;
  tokenType: string;
  accessExpiresIn: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionStore);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login/`, credentials).pipe(
      tap((res) => {
        this.session.setTokens(res.access, res.refresh);
      }),
    );
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/profile/`).pipe(
      tap((user) => {
        this.session.setUser(user);
        this.loadAccess().subscribe();
      }),
    );
  }

  loadAccess(): Observable<EffectivePermission[]> {
    return this.http
      .get<EffectivePermission[]>(`${this.baseUrl}/access/`, {
        headers: { [SILENT_ERRORS_HEADER]: 'true' },
      })
      .pipe(
        tap((perms) => {
          this.session.setPermissions(perms);
        }),
      );
  }

  updateProfile(payload: Partial<UserPayload>): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/profile/`, payload).pipe(
      tap((user) => this.session.setUser(user)),
    );
  }

  refresh(refreshToken: string): Observable<{ access: string }> {
    return this.http
      .post<{ access: string }>(`${this.baseUrl}/refresh/`, { refresh: refreshToken })
      .pipe(
        tap((res) => {
          this.session.setTokens(res.access, refreshToken);
        }),
      );
  }

  logout(): void {
    const refresh = this.session.refreshToken();
    if (refresh) {
      this.http.post(`${this.baseUrl}/logout/`, { refresh }).subscribe({
        error: () => {},
      });
    }
    this.session.clear();
  }
}
