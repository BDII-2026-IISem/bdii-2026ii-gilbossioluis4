export type DomainFieldType = 'text' | 'password' | 'textarea' | 'number' | 'datetime' | 'select' | 'multiselect' | 'checkbox' | 'state';

export interface DomainField {
  key: string;
  label: string;
  type: DomainFieldType;
  required?: boolean;
  optionPath?: string;
  optionLabel?: string;
  optionValue?: string;
  placeholder?: string;
  valueType?: 'number' | 'string';
  options?: DomainOption[];
  requiredOnCreate?: boolean;
  writeOnly?: boolean;
  step?: number;
}

export interface DomainColumn {
  key: string;
  label: string;
  format?: 'cop' | 'datetime';
}

export interface DomainOption {
  id: string | number;
  [key: string]: unknown;
}

export interface DomainDefinition {
  path: string;
  title: string;
  description: string;
  readOnly?: boolean;
  columns: DomainColumn[];
  fields: DomainField[];
}

const activeField: DomainField = { key: 'isActive', label: 'Activo', type: 'checkbox' };
const descriptionField: DomainField = { key: 'descripcion', label: 'Descripción', type: 'textarea' };

export const DOMAIN_DEFINITIONS: Record<string, DomainDefinition> = {
  pasajeros: {
    path: 'pasajeros',
    title: 'Pasajeros',
    description: 'Personas que solicitan servicios de transporte.',
    columns: [{ key: 'nombre', label: 'Nombre' }, { key: 'descripcion', label: 'Descripción' }, { key: 'isActive', label: 'Estado' }],
    fields: [{ key: 'nombre', label: 'Nombre', type: 'text', required: true }, descriptionField, activeField],
  },
  empresas: {
    path: 'empresas',
    title: 'Empresas',
    description: 'Empresas afiliadas y su contacto principal.',
    columns: [{ key: 'nit', label: 'NIT' }, { key: 'razonSocial', label: 'Razón social' }, { key: 'contactoPrincipal', label: 'Contacto' }, { key: 'isActive', label: 'Estado' }],
    fields: [
      { key: 'nit', label: 'NIT', type: 'text', required: true },
      { key: 'razonSocial', label: 'Razón social', type: 'text', required: true },
      { key: 'contactoPrincipal', label: 'Contacto principal', type: 'text' },
      activeField,
    ],
  },
  conductores: {
    path: 'conductores',
    title: 'Conductores',
    description: 'Conductores vinculados a empresas afiliadas.',
    columns: [{ key: 'nombre', label: 'Nombre' }, { key: 'empresaNombre', label: 'Empresa' }, { key: 'descripcion', label: 'Descripción' }, { key: 'isActive', label: 'Estado' }],
    fields: [
      { key: 'empresaId', label: 'Empresa', type: 'select', required: true, valueType: 'number', optionPath: 'empresas?is_active=true', optionLabel: 'razonSocial' },
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      descriptionField,
      activeField,
    ],
  },
  vehiculos: {
    path: 'vehiculos',
    title: 'Vehículos',
    description: 'Flota registrada por empresa afiliada.',
    columns: [{ key: 'nombre', label: 'Vehículo' }, { key: 'empresaNombre', label: 'Empresa' }, { key: 'descripcion', label: 'Descripción' }, { key: 'isActive', label: 'Estado' }],
    fields: [
      { key: 'empresaId', label: 'Empresa', type: 'select', required: true, valueType: 'number', optionPath: 'empresas?is_active=true', optionLabel: 'razonSocial' },
      { key: 'nombre', label: 'Vehículo', type: 'text', required: true },
      descriptionField,
      activeField,
    ],
  },
  turnos: {
    path: 'turnos',
    title: 'Turnos',
    description: 'Asignaciones de conductor y vehículo.',
    columns: [{ key: 'nombre', label: 'Turno' }, { key: 'conductorNombre', label: 'Conductor' }, { key: 'vehiculoNombre', label: 'Vehículo' }, { key: 'isActive', label: 'Estado' }],
    fields: [
      { key: 'conductorId', label: 'Conductor', type: 'select', required: true, valueType: 'number', optionPath: 'conductores?is_active=true', optionLabel: 'nombre' },
      { key: 'vehiculoId', label: 'Vehículo', type: 'select', required: true, valueType: 'number', optionPath: 'vehiculos?is_active=true', optionLabel: 'nombre' },
      { key: 'nombre', label: 'Nombre del turno', type: 'text', required: true },
      descriptionField,
      activeField,
    ],
  },
  tarifas: {
    path: 'tarifas',
    title: 'Tarifas',
    description: 'Reglas vigentes de cálculo del servicio.',
    columns: [
      { key: 'nombre', label: 'Tarifa' },
      { key: 'valorBase', label: 'Valor base', format: 'cop' },
      { key: 'vigenciaDesde', label: 'Vigente desde', format: 'datetime' },
      { key: 'vigenciaHasta', label: 'Vigente hasta', format: 'datetime' },
      { key: 'isActive', label: 'Estado' },
    ],
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'reglaCalculo', label: 'Regla de cálculo', type: 'textarea', required: true },
      { key: 'valorBase', label: 'Valor base (COP)', type: 'number', required: true, step: 1 },
      { key: 'vigenciaDesde', label: 'Vigencia desde', type: 'datetime', required: true },
      { key: 'vigenciaHasta', label: 'Vigencia hasta', type: 'datetime' },
      activeField,
    ],
  },
  carreras: {
    path: 'carreras',
    title: 'Carreras',
    description: 'Despacho y seguimiento de los viajes.',
    columns: [
      { key: 'id', label: 'Carrera' },
      { key: 'pasajeroNombre', label: 'Pasajero' },
      { key: 'conductorNombre', label: 'Conductor' },
      { key: 'empresaNombre', label: 'Empresa' },
      { key: 'vehiculoNombre', label: 'Vehículo' },
      { key: 'tarifaNombre', label: 'Tarifa' },
      { key: 'fechaInicio', label: 'Inicio', format: 'datetime' },
      { key: 'fechaFin', label: 'Fin', format: 'datetime' },
      { key: 'total', label: 'Total', format: 'cop' },
      { key: 'estado', label: 'Estado' },
      { key: 'observaciones', label: 'Observaciones' },
    ],
    fields: [
      { key: 'pasajeroId', label: 'Pasajero', type: 'select', required: true, valueType: 'number', optionPath: 'pasajeros?is_active=true', optionLabel: 'nombre' },
      { key: 'turnoId', label: 'Turno', type: 'select', required: true, valueType: 'number', optionPath: 'turnos?is_active=true', optionLabel: 'nombre' },
      { key: 'tarifaId', label: 'Tarifa', type: 'select', required: true, valueType: 'number', optionPath: 'tarifas?is_active=true', optionLabel: 'nombre' },
      { key: 'fechaInicio', label: 'Fecha de inicio', type: 'datetime', required: true },
      { key: 'estado', label: 'Estado', type: 'state', required: true },
      { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
    ],
  },
  pagos: {
    path: 'pagos',
    title: 'Pagos',
    description: 'Registro de cobros asociados a carreras finalizadas.',
    columns: [
      { key: 'carreraId', label: 'Carrera' },
      { key: 'carreraPasajeroNombre', label: 'Pasajero' },
      { key: 'carreraConductorNombre', label: 'Conductor' },
      { key: 'carreraEmpresaNombre', label: 'Empresa' },
      { key: 'carreraVehiculoNombre', label: 'Vehículo' },
      { key: 'carreraFechaInicio', label: 'Viaje', format: 'datetime' },
      { key: 'referenciaTipo', label: 'Referencia' },
      { key: 'metodo', label: 'Método' },
      { key: 'monto', label: 'Monto', format: 'cop' },
      { key: 'fecha', label: 'Fecha de pago', format: 'datetime' },
      { key: 'estado', label: 'Estado' },
    ],
    fields: [
      { key: 'carreraId', label: 'Carrera finalizada', type: 'select', required: true, valueType: 'number', optionPath: 'carreras?estado=FINALIZADA', optionLabel: 'detalle' },
      { key: 'referenciaTipo', label: 'Tipo de referencia', type: 'text' },
      { key: 'referenciaId', label: 'Referencia ID', type: 'number', required: true },
      { key: 'metodo', label: 'Método de pago', type: 'text', required: true },
      { key: 'monto', label: 'Monto (COP)', type: 'number', required: true, step: 1 },
      { key: 'fecha', label: 'Fecha', type: 'datetime' },
      { key: 'estado', label: 'Estado', type: 'text' },
    ],
  },
  calificaciones: {
    path: 'calificaciones',
    title: 'Calificaciones',
    description: 'Opiniones de pasajeros sobre carreras finalizadas.',
    readOnly: true,
    columns: [{ key: 'carreraId', label: 'Carrera' }, { key: 'nombre', label: 'Calificación' }, { key: 'descripcion', label: 'Descripción' }, { key: 'isActive', label: 'Estado' }],
    fields: [
      { key: 'carreraId', label: 'Carrera finalizada', type: 'select', required: true, valueType: 'number', optionPath: 'carreras?estado=FINALIZADA', optionLabel: 'detalle' },
      { key: 'nombre', label: 'Calificación', type: 'text', required: true },
      descriptionField,
      activeField,
    ],
  },
  liquidaciones: {
    path: 'liquidaciones',
    title: 'Liquidaciones',
    description: 'Agrupaciones de carreras cerradas por conductor.',
    columns: [{ key: 'id', label: 'Liquidación' }, { key: 'conductorNombre', label: 'Conductor' }, { key: 'carreraIds', label: 'Carreras' }, { key: 'fecha', label: 'Fecha' }, { key: 'valor', label: 'Valor' }, { key: 'estado', label: 'Estado' }],
    fields: [
      { key: 'carrerasIds', label: 'Carreras finalizadas', type: 'multiselect', required: true, optionPath: 'carreras?estado=FINALIZADA', optionLabel: 'detalle' },
      { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
    ],
  },
  usuarios: {
    path: 'users',
    title: 'Usuarios',
    description: 'Cuentas que pueden acceder a MoviCab.',
    columns: [
      { key: 'username', label: 'Usuario' },
      { key: 'email', label: 'Correo' },
      { key: 'status', label: 'Estado' },
    ],
    fields: [
      { key: 'username', label: 'Usuario', type: 'text', required: true },
      { key: 'email', label: 'Correo electrónico', type: 'text', required: true },
      { key: 'password', label: 'Nueva contraseña', type: 'password', requiredOnCreate: true, writeOnly: true, placeholder: 'Deja vacío para conservarla' },
      {
        key: 'status',
        label: 'Estado',
        type: 'select',
        required: true,
        options: [{ id: 'active', label: 'Activo' }, { id: 'inactive', label: 'Inactivo' }],
      },
    ],
  },
  roles: {
    path: 'roles',
    title: 'Roles',
    description: 'Perfiles utilizados para agrupar permisos de acceso.',
    columns: [
      { key: 'name', label: 'Nombre' },
      { key: 'description', label: 'Descripción' },
      { key: 'status', label: 'Estado' },
    ],
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true },
      { key: 'description', label: 'Descripción', type: 'textarea' },
      {
        key: 'status',
        label: 'Estado',
        type: 'select',
        required: true,
        options: [{ id: 'active', label: 'Activo' }, { id: 'inactive', label: 'Inactivo' }],
      },
    ],
  },
  'role-users': {
    path: 'role-users',
    title: 'Asignaciones de roles',
    description: 'Vincula usuarios con roles y controla si la asignación está activa.',
    columns: [
      { key: 'userName', label: 'Usuario' },
      { key: 'roleName', label: 'Rol' },
      { key: 'status', label: 'Estado' },
    ],
    fields: [
      { key: 'user', label: 'Usuario', type: 'select', required: true, valueType: 'number', optionPath: 'users', optionLabel: 'username' },
      { key: 'role', label: 'Rol', type: 'select', required: true, valueType: 'number', optionPath: 'roles', optionLabel: 'name' },
      {
        key: 'status',
        label: 'Estado',
        type: 'select',
        required: true,
        options: [{ id: 'active', label: 'Activo' }, { id: 'inactive', label: 'Inactivo' }],
      },
    ],
  },
  resources: {
    path: 'resources',
    title: 'Recursos',
    description: 'Cada recurso representa una combinación de método y ruta protegida por permisos.',
    columns: [
      { key: 'name', label: 'Nombre' },
      { key: 'method', label: 'Método' },
      { key: 'route', label: 'Ruta API' },
      { key: 'status', label: 'Estado' },
    ],
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true },
      {
        key: 'method',
        label: 'Método HTTP',
        type: 'select',
        required: true,
        options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((method) => ({ id: method, label: method })),
      },
      {
        key: 'route',
        label: 'Ruta exacta de Django',
        type: 'text',
        required: true,
        placeholder: 'api/pasajeros/ (incluya api/ y la barra final)',
      },
      {
        key: 'status',
        label: 'Estado',
        type: 'select',
        required: true,
        options: [{ id: 'active', label: 'Activo' }, { id: 'inactive', label: 'Inactivo' }],
      },
    ],
  },
  'resource-roles': {
    path: 'resource-roles',
    title: 'Concesiones',
    description: 'Concede a un rol acceso a un método y ruta concretos. Los permisos efectivos de cada usuario provienen de sus roles asignados.',
    columns: [
      { key: 'resourceMethod', label: 'Método' },
      { key: 'resourceRoute', label: 'Ruta protegida' },
      { key: 'resourceName', label: 'Recurso' },
      { key: 'roleName', label: 'Rol autorizado' },
      { key: 'status', label: 'Estado' },
    ],
    fields: [
      { key: 'resource', label: 'Recurso (método + ruta)', type: 'select', required: true, valueType: 'number', optionPath: 'resources', optionLabel: 'label' },
      { key: 'role', label: 'Rol', type: 'select', required: true, valueType: 'number', optionPath: 'roles', optionLabel: 'name' },
      {
        key: 'status',
        label: 'Estado',
        type: 'select',
        required: true,
        options: [{ id: 'active', label: 'Activo' }, { id: 'inactive', label: 'Inactivo' }],
      },
    ],
  },
};