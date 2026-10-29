import { Status, Timestamps } from './api.model';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface Role extends Timestamps {
  id: number;
  name: string;
  description: string | null;
  status: Status;
}

export interface Resource extends Timestamps {
  id: number;
  name: string;
  method: HttpMethod;
  route: string;
  status: Status;
}

export interface RoleUser extends Timestamps {
  id: number;
  role: number;
  user: number;
  status: Status;
}

export interface ResourceRole extends Timestamps {
  id: number;
  resource: number;
  role: number;
  status: Status;
}
