import { Status } from './api.model';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  status: Status;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPayload {
  username?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  status?: Status;
}

export interface EffectivePermission {
  method: string;
  route: string;
}
