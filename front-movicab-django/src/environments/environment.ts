/**
 * `apiUrl` termina en `/api` SIN barra final: cada servicio añade la suya
 * (`${base}/`) porque todas las rutas del contrato de Django terminan en `/`.
 */
export const environment = {
  production: true,
  appName: 'MoviCab',
  apiUrl: 'http://localhost:8000/api',
  requireAuth: false,
  primeUiLicense: '',
};