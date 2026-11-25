import { Injectable, computed, signal } from '@angular/core';
import { EffectivePermission, SessionUser, TokenPair } from '../models/auth.model';

const STORAGE_KEY = 'movicab.session.v1';

function samePath(pattern: string, path: string): boolean {
  const segments = (value: string) =>
    value
      .split('?')[0]
      .split('/')
      .filter(Boolean)
      .map((segment) => (/^<[^>]+>$|^:[^/]+$/.test(segment) ? '*' : segment));
  const expected = segments(pattern);
  const actual = segments(path);
  return expected.length === actual.length && expected.every(
    (segment, index) => segment === '*' || actual[index] === '*' || segment === actual[index]
  );
}

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly _accessToken = signal<string | null>(null);
  private readonly _refreshToken = signal<string | null>(null);
  private readonly _user = signal<SessionUser | null>(null);
  private readonly _permissions = signal<EffectivePermission[]>([]);

  readonly accessToken = this._accessToken.asReadonly();
  readonly refreshToken = this._refreshToken.asReadonly();
  readonly user = this._user.asReadonly();
  readonly permissions = this._permissions.asReadonly();

  readonly isAuthenticated = computed(() => this._accessToken() !== null);
  readonly permissionCount = computed(() => this._permissions().length);
  readonly roles = computed(() => [
    ...new Set(this._permissions().map((permission) => permission.roleName).filter(
      (roleName): roleName is string => roleName !== null,
    )),
  ].sort());

  constructor() {
    this.restore();
  }

  setTokens(t: TokenPair): void {
    this._accessToken.set(t.access);
    this._refreshToken.set(t.refresh);
    this.persist();
  }

  setUser(u: SessionUser, p: EffectivePermission[]): void {
    this._user.set(u);
    this._permissions.set(p);
    this.persist();
  }

  clear(): void {
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._user.set(null);
    this._permissions.set([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* sin almacenamiento */
    }
  }

  canPermission(key: string): boolean {
    const separator = key.indexOf(' ');
    if (separator < 0) {
      return false;
    }
    const method = key.slice(0, separator).toUpperCase();
    return this._permissions().some(
      (p) => p.method === method && samePath(p.path, key.slice(separator + 1))
    );
  }

  private restore(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      const data = JSON.parse(raw) as {
        access: string;
        refresh: string;
        user: SessionUser | null;
        permissions: EffectivePermission[];
      };
      if (!Array.isArray(data.permissions)) {
        this.clear();
        return;
      }
      this._accessToken.set(data.access || null);
      this._refreshToken.set(data.refresh || null);
      this._user.set(data.user ?? null);
      this._permissions.set(data.permissions);
    } catch {
      this.clear();
    }
  }

  private persist(): void {
    const raw = JSON.stringify({
      access: this._accessToken() ?? '',
      refresh: this._refreshToken() ?? '',
      user: this._user(),
      permissions: this._permissions(),
    });
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(STORAGE_KEY, raw);
    } catch {
      /* cuota llena */
    }
  }
}
