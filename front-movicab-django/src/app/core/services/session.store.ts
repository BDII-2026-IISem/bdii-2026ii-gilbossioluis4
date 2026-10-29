import { Injectable, computed, signal } from '@angular/core';
import { EffectivePermission, User } from '../models/user.model';
import { environment } from '../../../environments/environment';

const STORAGE_KEY = 'movicab.django.session.v1';

interface SessionState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  permissions: EffectivePermission[];
  permissionsKnown: boolean;
}

@Injectable({ providedIn: 'root' })
export class SessionStore {
  readonly accessToken = signal<string | null>(null);
  readonly refreshToken = signal<string | null>(null);
  readonly user = signal<User | null>(null);
  readonly permissions = signal<EffectivePermission[]>([]);
  readonly permissionsKnown = signal<boolean>(false);

  readonly isAuthenticated = computed(() => !!this.accessToken());
  readonly permissionCount = computed(() => this.permissions().length);

  constructor() {
    this.restoreSession();
  }

  setTokens(access: string, refresh: string): void {
    this.accessToken.set(access);
    this.refreshToken.set(refresh);
    this.saveToStorage();
  }

  setUser(user: User): void {
    this.user.set(user);
    this.saveToStorage();
  }

  setPermissions(permissions: EffectivePermission[]): void {
    this.permissions.set(permissions);
    this.permissionsKnown.set(true);
    this.saveToStorage();
  }

  clear(): void {
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.user.set(null);
    this.permissions.set([]);
    this.permissionsKnown.set(false);
    localStorage.removeItem(STORAGE_KEY);
  }

  canPermission(permissionKey: string): boolean {
    const parts = permissionKey.trim().split(' ');
    if (parts.length < 2) return false;
    const method = parts[0];
    const path = parts.slice(1).join(' ');
    return this.can(method, path);
  }

  can(method: string, path: string): boolean {
    if (!environment.requireAuth) return true;
    if (!this.permissionsKnown()) {
      return !path.startsWith('api/security') && !path.startsWith('security');
    }

    const cleanPath = path.replace(/^\//, '');
    const normMethod = method.toUpperCase();

    return this.permissions().some((p) => {
      if (p.method.toUpperCase() !== normMethod) return false;
      const pattern = p.route
        .replace(/<int:pk>/g, '[^/]+')
        .replace(/:id/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(cleanPath);
    });
  }

  private saveToStorage(): void {
    const state: SessionState = {
      accessToken: this.accessToken(),
      refreshToken: this.refreshToken(),
      user: this.user(),
      permissions: this.permissions(),
      permissionsKnown: this.permissionsKnown(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  private restoreSession(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed: SessionState = JSON.parse(raw);
      this.accessToken.set(parsed.accessToken);
      this.refreshToken.set(parsed.refreshToken);
      this.user.set(parsed.user);
      this.permissions.set(parsed.permissions || []);
      this.permissionsKnown.set(parsed.permissionsKnown || false);
    } catch {
      this.clear();
    }
  }
}
