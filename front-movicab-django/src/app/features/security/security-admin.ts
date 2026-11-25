import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import {
  SecurityApi,
  ResourceRoleGrant,
  SecurityResource,
  SecurityRole,
  SecurityUser,
  RoleUserAssignment,
  UserResourcePermission,
} from './security-api';
import { NotificationService } from '../../core/services/notification';
import { toApiMessage } from '../../core/utils/to-api-message';

type CrudMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';
type AdminTab = 'roles' | 'users' | 'resources';
const CRUD_METHODS: CrudMethod[] = ['POST', 'GET', 'PATCH', 'DELETE'];
const CRUD_ACTIONS: { method: CrudMethod; label: string }[] = [
  { method: 'POST', label: 'Crear' },
  { method: 'GET', label: 'Leer' },
  { method: 'PATCH', label: 'Actualizar' },
  { method: 'DELETE', label: 'Eliminar' },
];
const NAME_COLLATOR = new Intl.Collator('es', { sensitivity: 'base', numeric: true });
const RESOURCE_LABELS: Record<string, string> = {
  pasajeros: 'Pasajeros',
  empresas: 'Empresas',
  conductores: 'Conductores',
  vehiculos: 'Vehículos',
  turnos: 'Turnos',
  tarifas: 'Tarifas',
  carreras: 'Carreras',
  pagos: 'Pagos',
  calificaciones: 'Calificaciones',
  liquidaciones: 'Liquidaciones',
  users: 'Usuarios',
  roles: 'Roles',
  'role-users': 'Asignaciones de roles',
  resources: 'Recursos',
  'resource-roles': 'Permisos por rol',
  'user-resource-permissions': 'Permisos directos',
};
const ADMIN_SECURITY_RESOURCE_PREFIXES = [
  'api/users/',
  'api/roles/',
  'api/role-users/',
  'api/resources/',
  'api/resource-roles/',
  'api/user-resource-permissions/',
];

function permissionGroupRoute(route: string): string {
  return route.replace(/<int:pk>/g, '').replace(/\/+/g, '/');
}

function resourceGroupName(route: string, fallback: string): string {
  const key = route.replace(/^api\//, '').split('/').filter(Boolean)[0] ?? '';
  return RESOURCE_LABELS[key] ?? fallback;
}

@Component({
  selector: 'app-security-admin',
  standalone: true,
  imports: [ButtonModule, DialogModule, MessageModule, ReactiveFormsModule],
  templateUrl: './security-admin.html',
  styleUrl: './security-admin.css',
  host: { class: 'block' },
})
export class SecurityAdmin {
  private readonly api = inject(SecurityApi);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly notify = inject(NotificationService);

  readonly users = signal<SecurityUser[]>([]);
  readonly roles = signal<SecurityRole[]>([]);
  readonly resources = signal<SecurityResource[]>([]);
  readonly roleUsers = signal<RoleUserAssignment[]>([]);
  readonly grants = signal<ResourceRoleGrant[]>([]);
  readonly userPermissions = signal<UserResourcePermission[]>([]);
  readonly activeTab = signal<AdminTab>('users');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly savingPermissions = signal(false);
  readonly error = signal<string | null>(null);
  readonly dialogVisible = signal(false);
  readonly selectedUserForRole = signal<number | null>(null);
  readonly selectedRoleId = signal<number | null>(null);
  readonly selectedRoleIds = signal<number[]>([]);
  readonly selectedUserId = signal<number | null>(null);
  readonly roleFilter = signal('');
  readonly resourceFilter = signal('');
  readonly userFilter = signal('');
  readonly userStatusFilter = signal<'all' | 'active' | 'inactive'>('all');
  readonly userSortOrder = signal<'asc' | 'desc'>('asc');
  readonly editing = signal<SecurityUser | null>(null);

  readonly form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(8)]],
  });

  readonly roleForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
  });

  readonly crudMethods = CRUD_METHODS;
  readonly crudActions = CRUD_ACTIONS;
  readonly activeRole = computed(() => this.roles().find((role) => role.id === this.selectedRoleId()) ?? null);
  readonly selectedUser = computed(
    () => this.users().find((user) => user.id === this.selectedUserId()) ?? null,
  );
  readonly visibleUsers = computed(() => {
    const query = this.userFilter().trim().toLocaleLowerCase();
    const status = this.userStatusFilter();
    const direction = this.userSortOrder() === 'asc' ? 1 : -1;
    return this.users()
      .filter((user) => {
        const matchesName = !query
          || user.username.toLocaleLowerCase().includes(query)
          || user.email.toLocaleLowerCase().includes(query);
        const matchesStatus = status === 'all' || user.status === status;
        return matchesName && matchesStatus;
      })
      .sort((left, right) => direction * NAME_COLLATOR.compare(left.username, right.username));
  });
  readonly visibleRoles = computed(() => {
    const query = this.roleFilter().trim().toLocaleLowerCase();
    return this.roles().filter((role) =>
      !query || role.name.toLocaleLowerCase().includes(query)
      || (role.description ?? '').toLocaleLowerCase().includes(query),
    );
  });
  readonly visibleResources = computed(() => {
    const query = this.resourceFilter().trim().toLocaleLowerCase();
    return this.resources().filter((resource) =>
      !query || resource.name.toLocaleLowerCase().includes(query)
      || resource.route.toLocaleLowerCase().includes(query)
      || resource.method.toLocaleLowerCase().includes(query),
    ).sort((left, right) => NAME_COLLATOR.compare(left.route, right.route)
      || NAME_COLLATOR.compare(left.method, right.method));
  });
  readonly groupedResources = computed(() => {
    const groups = new Map<string, SecurityResource[]>();
    for (const resource of this.resources()) {
      const route = permissionGroupRoute(resource.route);
      const current = groups.get(route) ?? [];
      current.push(resource);
      groups.set(route, current);
    }
    return [...groups.entries()]
      .map(([route, resources]) => ({
        route,
        name: resourceGroupName(route, resources[0]?.name ?? route),
        resources,
      }))
      .sort((left, right) => NAME_COLLATOR.compare(left.route, right.route));
  });
  readonly userPermissionGroups = this.groupedResources;
  readonly selectedRoleAssignments = computed(() => this.roleUsers().filter(
    (assignment) => assignment.role === this.selectedRoleId() && assignment.status === 'active',
  ));
  readonly availableUsersForRole = computed(() => {
    const roleId = this.selectedRoleId();
    if (!roleId) return [];
    const assigned = new Set(this.roleUsers()
      .filter((assignment) => assignment.role === roleId && assignment.status === 'active')
      .map((assignment) => assignment.user));
    return this.users().filter((user) => user.status === 'active' && !assigned.has(user.id));
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      users: this.api.listUsers(),
      roles: this.api.listRoles(),
      resources: this.api.listResources(),
      roleUsers: this.api.listRoleUsers(),
      grants: this.api.listResourceRoles(),
      userPermissions: this.api.listUserResourcePermissions(),
    }).subscribe({
      next: (data) => {
        this.users.set(data.users);
        const activeRoles = data.roles.filter((role) => role.status === 'active');
        this.roles.set(activeRoles);
        this.resources.set(data.resources.filter((resource) => resource.status === 'active'));
        this.roleUsers.set(data.roleUsers);
        this.grants.set(data.grants);
        this.userPermissions.set(data.userPermissions);
        const selectedRole = activeRoles.find((role) => role.id === this.selectedRoleId());
        if (selectedRole) {
          this.roleForm.patchValue({
            name: selectedRole.name,
            description: selectedRole.description ?? '',
          });
        } else if (this.selectedRoleId() === null && activeRoles.length) {
          this.selectRole(activeRoles[0].id);
        } else if (!activeRoles.some((role) => role.id === this.selectedRoleId())) {
          this.selectedRoleId.set(null);
          this.roleForm.reset({ name: '', description: '' });
        }
        if (!this.selectedUserId() && data.users.length) {
          this.selectedUserId.set(data.users[0].id);
        }
        if (this.selectedUserId() && !data.users.some((user) => user.id === this.selectedUserId())) {
          this.selectedUserId.set(data.users[0]?.id ?? null);
        }
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  selectUser(userId: number): void {
    this.selectedUserId.set(userId);
  }

  selectRole(roleId: number | null): void {
    this.selectedRoleId.set(roleId);
    const role = this.roles().find((item) => item.id === roleId);
    this.roleForm.reset({
      name: role?.name ?? '',
      description: role?.description ?? '',
    });
    this.selectedUserForRole.set(null);
  }

  startNewRole(): void {
    this.selectRole(null);
    this.activeTab.set('roles');
  }

  saveRole(): void {
    if (this.roleForm.invalid || this.saving()) {
      this.roleForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const current = this.activeRole();
    const payload = {
      ...this.roleForm.getRawValue(),
      status: current?.status ?? ('active' as const),
    };
    const request = current
      ? this.api.updateRole(current.id, payload)
      : this.api.createRole(payload);
    request.subscribe({
      next: (role) => {
        this.saving.set(false);
        this.selectedRoleId.set(role.id);
        this.notify.success('Rol guardado', `Se guardó el rol ${role.name}.`);
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo guardar el rol', toApiMessage(error));
      },
    });
  }

  deleteSelectedRole(): void {
    const role = this.activeRole();
    if (!role || role.name.toUpperCase() === 'ADMIN' || this.saving()) return;
    if (!window.confirm(`¿Desactivar el rol ${role.name}?`)) return;
    this.saving.set(true);
    this.api.updateRole(role.id, { status: 'inactive' }).subscribe({
      next: () => {
        this.saving.set(false);
        this.selectRole(null);
        this.notify.success('Rol desactivado', `Se desactivó el rol ${role.name}.`);
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo desactivar el rol', toApiMessage(error));
      },
    });
  }

  assignUserToRole(): void {
    const roleId = this.selectedRoleId();
    const userId = this.selectedUserForRole();
    if (!roleId || !userId || this.saving()) return;
    const existing = this.roleUsers().find(
      (assignment) => assignment.role === roleId && assignment.user === userId,
    );
    this.saving.set(true);
    const request = existing
      ? this.api.updateRoleUser(existing.id, 'active')
      : this.api.createRoleUser({ user: userId, role: roleId, status: 'active' });
    request.subscribe({
      next: (assignment) => {
        this.saving.set(false);
        this.roleUsers.update((items) => [
          ...items.filter((item) => item.id !== assignment.id),
          assignment,
        ]);
        this.selectedUserForRole.set(null);
        this.notify.success('Usuario asignado', 'Se actualizó la asignación del rol.');
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo asignar el usuario', toApiMessage(error));
      },
    });
  }

  removeUserFromRole(assignment: RoleUserAssignment): void {
    const role = this.roleById(assignment.role);
    if (this.saving() || !this.canRemoveRoleAssignment(assignment)) return;
    this.saving.set(true);
    this.api.updateRoleUser(assignment.id, 'inactive').subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.roleUsers.update((items) => items.map((item) => item.id === updated.id ? updated : item));
        this.notify.success('Asignación retirada', `Se retiró el rol ${role?.name ?? ''} del usuario.`);
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo retirar la asignación', toApiMessage(error));
      },
    });
  }

  canRemoveRoleAssignment(assignment: RoleUserAssignment): boolean {
    const role = this.roleById(assignment.role);
    if (role?.name.toUpperCase() !== 'ADMIN') return true;
    const activeAdmins = this.roleUsers().filter((item) =>
      item.role === role.id && item.status === 'active'
      && this.users().some((user) => user.id === item.user && user.status === 'active'),
    );
    return activeAdmins.length > 1;
  }

  hasUserRole(userId: number, roleId: number): boolean {
    return this.roleUsers().some((assignment) =>
      assignment.user === userId
      && assignment.role === roleId
      && assignment.status === 'active',
    );
  }

  canRemoveUserRole(userId: number, roleId: number): boolean {
    const assignment = this.roleUsers().find((item) =>
      item.user === userId && item.role === roleId && item.status === 'active',
    );
    return !assignment || this.canRemoveRoleAssignment(assignment);
  }

  isLastAdmin(userId: number): boolean {
    const adminRole = this.roles().find((role) => role.name.toUpperCase() === 'ADMIN');
    return !!adminRole
      && this.hasUserRole(userId, adminRole.id)
      && !this.canRemoveUserRole(userId, adminRole.id);
  }

  setUserRole(userId: number, roleId: number, checked: boolean): void {
    if (this.saving() || !this.canRemoveUserRole(userId, roleId) && !checked) return;
    const assignment = this.roleUsers().find((item) =>
      item.user === userId && item.role === roleId,
    );
    if (!checked && (!assignment || assignment.status !== 'active')) return;
    this.saving.set(true);
    const request = assignment
      ? this.api.updateRoleUser(assignment.id, checked ? 'active' : 'inactive')
      : this.api.createRoleUser({ user: userId, role: roleId, status: 'active' });
    request.subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.roleUsers.update((items) => [
          ...items.filter((item) => item.id !== updated.id),
          updated,
        ]);
        this.notify.success(
          checked ? 'Rol asignado' : 'Rol retirado',
          `Se actualizó la asignación de ${this.roleById(roleId)?.name ?? 'rol'}.`,
        );
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo actualizar el rol', toApiMessage(error));
      },
    });
  }

  userById(userId: number): SecurityUser | undefined {
    return this.users().find((user) => user.id === userId);
  }

  userPermissionState(resources: SecurityResource[], method: CrudMethod): 'all' | 'some' | 'none' {
    const matching = this.resourcesForMethod(resources, method);
    if (!matching.length) return 'none';
    const userId = this.selectedUserId();
    const granted = matching.filter((resource) =>
      this.userPermissions().some(
        (permission) =>
          permission.user === userId
          && permission.resource === resource.id
          && permission.status === 'active',
      ),
    ).length;
    if (granted === matching.length) return 'all';
    return granted ? 'some' : 'none';
  }

  setUserPermission(resources: SecurityResource[], method: CrudMethod, checked: boolean): void {
    const userId = this.selectedUserId();
    if (!userId || this.savingPermissions()) return;

    const matching = this.resourcesForMethod(resources, method);
    const requests: Observable<UserResourcePermission>[] = [];
    for (const resource of matching) {
      const current = this.userPermissions().find(
        (permission) => permission.user === userId && permission.resource === resource.id,
      );
      if (current) {
        const status = checked ? 'active' : 'inactive';
        if (current.status !== status) {
          requests.push(this.api.updateUserResourcePermission(current.id, status));
        }
      } else if (checked) {
        requests.push(this.api.createUserResourcePermission({
          user: userId,
          resource: resource.id,
          status: 'active',
        }));
      }
    }

    if (!requests.length) return;
    this.savingPermissions.set(true);
    forkJoin(requests).subscribe({
      next: (updated) => {
        this.userPermissions.update((current) => {
          const byId = new Map(current.map((permission) => [permission.id, permission]));
          for (const permission of updated) byId.set(permission.id, permission);
          return [...byId.values()];
        });
        this.savingPermissions.set(false);
        this.notify.success('Permisos actualizados', 'Los cambios directos se suman a los permisos heredados por roles.');
      },
      error: (error: unknown) => {
        this.savingPermissions.set(false);
        this.load();
        this.notify.error('No se pudieron actualizar los permisos', toApiMessage(error));
      },
    });
  }

  rolePermissionState(resources: SecurityResource[], method: CrudMethod): 'all' | 'some' | 'none' {
    const matching = this.resourcesForMethod(resources, method);
    if (!matching.length) return 'none';
    const granted = matching.filter((resource) => this.hasGrant(resource)).length;
    if (granted === matching.length) return 'all';
    return granted ? 'some' : 'none';
  }

  setRolePermission(resources: SecurityResource[], method: CrudMethod, checked: boolean): void {
    if (!checked && this.isProtectedAdminResource(resources)) return;
    this.saveRoleGrants(this.resourcesForMethod(resources, method), checked);
  }

  markAllRolePermissions(checked: boolean): void {
    const resources = this.groupedResources()
      .filter((group) => checked || !this.isProtectedAdminResource(group.resources))
      .flatMap((group) => group.resources);
    this.saveRoleGrants(resources, checked);
  }

  isProtectedAdminResource(resources: SecurityResource[]): boolean {
    return this.activeRole()?.name.toUpperCase() === 'ADMIN'
      && resources.some((resource) =>
        ADMIN_SECURITY_RESOURCE_PREFIXES.some((prefix) => resource.route.startsWith(prefix)),
      );
  }

  private saveRoleGrants(resources: SecurityResource[], checked: boolean): void {
    const roleId = this.selectedRoleId();
    if (!roleId || this.savingPermissions()) return;
    const requests: Observable<ResourceRoleGrant>[] = [];
    for (const resource of resources) {
      const current = this.grants().find((grant) => grant.role === roleId && grant.resource === resource.id);
      if (current) {
        const status = checked ? 'active' : 'inactive';
        if (current.status !== status) requests.push(this.api.updateResourceRole(current.id, status));
      } else if (checked) {
        requests.push(this.api.createResourceRole({ role: roleId, resource: resource.id, status: 'active' }));
      }
    }
    if (!requests.length) return;
    this.savingPermissions.set(true);
    forkJoin(requests).subscribe({
      next: (updated) => {
        this.grants.update((items) => {
          const byId = new Map(items.map((grant) => [grant.id, grant]));
          for (const grant of updated) byId.set(grant.id, grant);
          return [...byId.values()];
        });
        this.savingPermissions.set(false);
        this.notify.success('Permisos actualizados', 'Se guardaron los permisos CRUD del rol.');
      },
      error: (error: unknown) => {
        this.savingPermissions.set(false);
        this.load();
        this.notify.error('No se pudieron actualizar los permisos', toApiMessage(error));
      },
    });
  }

  private resourcesForMethod(resources: SecurityResource[], method: CrudMethod): SecurityResource[] {
    return resources.filter((resource) => method === 'PATCH'
      ? resource.method === 'PATCH' || resource.method === 'PUT'
      : resource.method === method);
  }

  openCreate(): void {
    this.editing.set(null);
    this.form.reset({ username: '', email: '', password: '' });
    this.selectedRoleIds.set([]);
    this.dialogVisible.set(true);
  }

  toggleRole(roleId: number): void {
    const selected = this.selectedRoleIds();
    const next = selected.includes(roleId) ? selected.filter((id) => id !== roleId) : [...selected, roleId];
    this.selectedRoleIds.set(next);
  }

  resourceGroupName(route: string, fallback: string): string {
    return resourceGroupName(route, fallback);
  }

  hasGrant(resource: SecurityResource): boolean {
    const roleId = this.selectedRoleId();
    return !!roleId && this.grants().some(
      (grant) => grant.role === roleId && grant.resource === resource.id && grant.status === 'active',
    );
  }

  roleCount(userId: number): number {
    return this.roleUsers().filter((assignment) => assignment.user === userId && assignment.status === 'active').length;
  }

  resourceFor(resources: SecurityResource[], method: CrudMethod): SecurityResource | undefined {
    return resources.find((resource) => resource.method === method);
  }

  hasUserPermissionResource(resources: SecurityResource[], method: CrudMethod): boolean {
    return this.resourcesForMethod(resources, method).length > 0;
  }

  roleById(roleId: number): SecurityRole | undefined {
    return this.roles().find((role) => role.id === roleId);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notify.error('Datos incompletos', 'Revisa el usuario, el correo y la contraseña.');
      return;
    }
    this.saving.set(true);
    const payload = { ...this.form.getRawValue(), status: 'active' as const };
    const request = this.editing()
      ? this.api.updateUser(this.editing()!.id, payload)
      : this.api.createUser(payload);
    request.pipe(
      switchMap((user) => this.saveAssignments(user.id).pipe(map(() => user.id))),
    ).subscribe({
      next: (userId) => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.selectedUserId.set(userId);
        this.notify.success('Usuario guardado', 'Los roles seleccionados quedaron asignados.');
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo guardar el usuario', toApiMessage(error));
      },
    });
  }

  private saveAssignments(userId: number): Observable<unknown> {
    const existing = this.roleUsers().filter((assignment) => assignment.user === userId);
    const requests: Observable<unknown>[] = [];
    for (const roleId of this.selectedRoleIds()) {
      const assignment = existing.find((item) => item.role === roleId);
      requests.push(assignment
        ? this.api.updateRoleUser(assignment.id, 'active')
        : this.api.createRoleUser({ user: userId, role: roleId, status: 'active' }));
    }
    return requests.length ? forkJoin(requests) : of([]);
  }
}
