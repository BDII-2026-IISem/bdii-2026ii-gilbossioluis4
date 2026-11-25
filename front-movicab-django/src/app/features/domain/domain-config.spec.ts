import { DOMAIN_DEFINITIONS } from './domain-config';

describe('DOMAIN_DEFINITIONS RBAC', () => {
  it('incluye los cinco módulos de administración con rutas de API Django', () => {
    expect(DOMAIN_DEFINITIONS['usuarios'].path).toBe('users');
    expect(DOMAIN_DEFINITIONS['roles'].path).toBe('roles');
    expect(DOMAIN_DEFINITIONS['role-users'].path).toBe('role-users');
    expect(DOMAIN_DEFINITIONS['resources'].path).toBe('resources');
    expect(DOMAIN_DEFINITIONS['resource-roles'].path).toBe('resource-roles');
  });

  it('exige contraseña al crear un usuario pero la deja opcional al editarlo', () => {
    const password = DOMAIN_DEFINITIONS['usuarios'].fields.find((field) => field.key === 'password');
    expect(password?.requiredOnCreate).toBe(true);
    expect(password?.writeOnly).toBe(true);
    expect(DOMAIN_DEFINITIONS['usuarios'].columns.some((column) => column.key === 'password')).toBe(false);
  });
});
