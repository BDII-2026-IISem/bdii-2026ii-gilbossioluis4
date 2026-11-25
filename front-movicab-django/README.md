# FrontMovicabDjango

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.4.

Para ubicar el frontend dentro del repositorio y entender cómo se conecta con
el backend MoviCab, consulta la [guía general](../../../GUIA_DEL_PROYECTO.md).

## Prerequisites

Angular CLI 22.2.4 requires Node.js 22.22.3 or newer in the 22.x line,
24.15.0 or newer in the 24.x line, or 26.0.0 or newer in the 26.x line.
Check the active runtime with `node --version`, then install the locked
dependencies with `npm ci`.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
npm test -- --watch=false
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Sesión y permisos

Después del inicio de sesión, la aplicación consulta `GET /api/auth/profile/` y
`GET /api/auth/permissions/`. El segundo endpoint devuelve las concesiones
efectivas del usuario con el método HTTP y la ruta de Django. La sesión usa esas
concesiones para proteger las rutas, filtrar el menú y mostrar u ocultar las
acciones de escritura.

La interfaz no reemplaza la autorización del servidor: las operaciones de la
API continúan protegidas por `HasResourceAccess` y deben responder con acceso
denegado cuando falte una concesión.

El grupo **Seguridad** ofrece mantenimiento de usuarios, roles, asignaciones de
roles, recursos y concesiones. Sus rutas y acciones siguen sujetas a la matriz
RBAC efectiva; para crear concesiones se deben registrar recursos con el método
y la ruta Django exactos que usa la API.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
