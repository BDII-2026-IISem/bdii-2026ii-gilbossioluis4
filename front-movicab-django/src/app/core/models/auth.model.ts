import { HttpMethod, Status, Timestamps } from './api.model';

export interface LoginRequest {
  username?: string;
  email?: string;
  password: string;
}

export interface TokenPair {
  access: string;
  refresh: string;
  tokenType: 'Bearer';
  accessExpiresIn: number;
}

export interface SessionUser extends Timestamps {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  status: Status;
}

export interface ProfileUpdatePayload {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface EffectivePermission {
  method: HttpMethod;
  path: string;
  roleId: number | null;
  roleName: string | null;
}
