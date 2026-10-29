import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión · MoviCab',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'construir',
    loadComponent: () => import('./features/construir/construir').then((m) => m.Construir),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'clientes' },
      {
        path: 'clientes',
        title: 'Clientes · MoviCab',
        loadComponent: () =>
          import('./features/clients/client-list/client-list').then((m) => m.ClientList),
      },
      {
        path: 'tipos-producto',
        title: 'Tipos de producto · MoviCab',
        loadComponent: () =>
          import('./features/product-types/product-type-list/product-type-list').then(
            (m) => m.ProductTypeList
          ),
      },
      {
        path: 'productos',
        title: 'Productos · MoviCab',
        loadComponent: () =>
          import('./features/products/product-list/product-list').then(
            (m) => m.ProductList
          ),
      },
      {
        path: 'ventas',
        title: 'Ventas · MoviCab',
        loadComponent: () =>
          import('./features/sales/sale-list/sale-list').then((m) => m.SaleList),
      },
      {
        path: 'ventas/:id',
        title: 'Detalle de venta · MoviCab',
        loadComponent: () =>
          import('./features/sales/sale-detail/sale-detail').then((m) => m.SaleDetail),
      },
      {
        path: 'detalle-ventas',
        title: 'Líneas de venta · MoviCab',
        loadComponent: () =>
          import('./features/product-sales/product-sale-list/product-sale-list').then(
            (m) => m.ProductSaleList
          ),
      },
      {
        path: 'dashboard',
        title: 'Panel · MoviCab',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'perfil',
        title: 'Mi sesión · MoviCab',
        loadComponent: () =>
          import('./features/auth/profile/profile').then((m) => m.Profile),
      },
    ],
  },
  { path: '**', redirectTo: 'construir' },
];
