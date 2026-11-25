import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Status } from '../../core/models/api.model';

export interface SecurityUser {
  id: number;
  username: string;
  email: string;
  status: Status;
}

export interface SecurityRole {
  id: number;
  name: string;
  description: string | null;
  status: Status;
}

export interface RolePayload {
  name: string;
  description: string;
  status: Status;
}

export interface SecurityResource {
  id: number;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  route: string;
  status: Status;
}

export interface RoleUserAssignment {
  id: number;
  user: number;
  role: number;
  status: Status;
}

export interface ResourceRoleGrant {
  id: number;
  resource: number;
  role: number;
  status: Status;
}

export interface UserResourcePermission {
  id: number;
  user: number;
  resource: number;
  status: Status;
}

export interface UserPayload {
  username: string;
  email: string;
  password?: string;
  status: Status;
}

@Injectable({ providedIn: 'root' })
export class SecurityApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  listUsers(): Observable<SecurityUser[]> {
    return this.http.get<SecurityUser[]>(`${this.base}/users/`);
  }

  listRoles(): Observable<SecurityRole[]> {
    return this.http.get<SecurityRole[]>(`${this.base}/roles/`);
  }

  listResources(): Observable<SecurityResource[]> {
    return this.http.get<SecurityResource[]>(`${this.base}/resources/`);
  }

  listRoleUsers(): Observable<RoleUserAssignment[]> {
    return this.http.get<RoleUserAssignment[]>(`${this.base}/role-users/`);
  }

  listResourceRoles(): Observable<ResourceRoleGrant[]> {
    return this.http.get<ResourceRoleGrant[]>(`${this.base}/resource-roles/`);
  }

  listUserResourcePermissions(): Observable<UserResourcePermission[]> {
    return this.http.get<UserResourcePermission[]>(`${this.base}/user-resource-permissions/`);
  }

  createUser(payload: UserPayload): Observable<SecurityUser> {
    return this.http.post<SecurityUser>(`${this.base}/users/`, payload);
  }

  createRole(payload: RolePayload): Observable<SecurityRole> {
    return this.http.post<SecurityRole>(`${this.base}/roles/`, payload);
  }

  updateRole(id: number, payload: Partial<RolePayload>): Observable<SecurityRole> {
    return this.http.patch<SecurityRole>(`${this.base}/roles/${id}/`, payload);
  }

  updateUser(id: number, payload: Partial<UserPayload>): Observable<SecurityUser> {
    return this.http.patch<SecurityUser>(`${this.base}/users/${id}/`, payload);
  }

  createRoleUser(payload: Omit<RoleUserAssignment, 'id'>): Observable<RoleUserAssignment> {
    return this.http.post<RoleUserAssignment>(`${this.base}/role-users/`, payload);
  }

  updateRoleUser(id: number, status: Status): Observable<RoleUserAssignment> {
    return this.http.patch<RoleUserAssignment>(`${this.base}/role-users/${id}/`, { status });
  }

  createResourceRole(payload: Omit<ResourceRoleGrant, 'id'>): Observable<ResourceRoleGrant> {
    return this.http.post<ResourceRoleGrant>(`${this.base}/resource-roles/`, payload);
  }

  updateResourceRole(id: number, status: Status): Observable<ResourceRoleGrant> {
    return this.http.patch<ResourceRoleGrant>(`${this.base}/resource-roles/${id}/`, { status });
  }

  createUserResourcePermission(
    payload: Omit<UserResourcePermission, 'id'>,
  ): Observable<UserResourcePermission> {
    return this.http.post<UserResourcePermission>(`${this.base}/user-resource-permissions/`, payload);
  }

  updateUserResourcePermission(id: number, status: Status): Observable<UserResourcePermission> {
    return this.http.patch<UserResourcePermission>(
      `${this.base}/user-resource-permissions/${id}/`,
      { status },
    );
  }
}
