import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { DrawerModule } from 'primeng/drawer';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../core/services/auth';
import { SessionStore } from '../../core/services/session-store';
import { watchMediaQuery } from '../../core/utils/media-query';
import { Aside } from '../aside/aside';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';

interface PermissionMenuItem extends MenuItem {
  permission: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, DrawerModule, ToastModule, Aside, Footer, Header],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
  host: { class: 'block' }
})
export class Shell {
  private readonly isDesktop = watchMediaQuery('(min-width: 1024px)');
  private readonly session = inject(SessionStore);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly sidebarCollapsed = signal(false);
  readonly mobileOpen = signal(false);
  readonly username = computed(() => this.session.user()?.username ?? '');
  readonly initials = computed(() => this.username().slice(0, 2).toUpperCase() || 'IN');
  readonly roleLabel = computed(() => this.session.roles().join(', ') || 'Sin rol');
  readonly permissionCount = this.session.permissionCount;
  readonly userItems: MenuItem[] = [
    { label: 'Mi perfil', icon: 'pi pi-user', routerLink: '/perfil' },
    { separator: true },
    { label: 'Cerrar sesión', icon: 'pi pi-sign-out', command: () => this.logout() },
  ];

  private readonly operationNavigation: PermissionMenuItem[] = [
    { label: 'Pasajeros', icon: 'pi pi-users', routerLink: '/pasajeros', permission: 'GET /api/pasajeros/' },
    { label: 'Empresas', icon: 'pi pi-building', routerLink: '/empresas', permission: 'GET /api/empresas/' },
    { label: 'Conductores', icon: 'pi pi-id-card', routerLink: '/conductores', permission: 'GET /api/conductores/' },
    { label: 'Vehículos', icon: 'pi pi-car', routerLink: '/vehiculos', permission: 'GET /api/vehiculos/' },
    { label: 'Turnos', icon: 'pi pi-clock', routerLink: '/turnos', permission: 'GET /api/turnos/' },
    { label: 'Tarifas', icon: 'pi pi-wallet', routerLink: '/tarifas', permission: 'GET /api/tarifas/' },
    { label: 'Carreras', icon: 'pi pi-map-marker', routerLink: '/carreras', permission: 'GET /api/carreras/' },
    { label: 'Pagos', icon: 'pi pi-credit-card', routerLink: '/pagos', permission: 'GET /api/pagos/' },
    { label: 'Calificaciones', icon: 'pi pi-star', routerLink: '/calificaciones', permission: 'GET /api/calificaciones/' },
    { label: 'Liquidaciones', icon: 'pi pi-file-check', routerLink: '/liquidaciones', permission: 'GET /api/liquidaciones/' },
  ];

  private readonly securityNavigation: PermissionMenuItem[] = [
    { label: 'Roles y permisos', icon: 'pi pi-shield', routerLink: '/usuarios', permission: 'GET /api/users/' },
  ];

  readonly items = computed<MenuItem[]>(() => {
    const operationItems = this.operationNavigation
      .filter((item) => this.session.canPermission(item.permission))
      .map(({ permission: _permission, ...item }) => item);
    const isAdmin = this.session.roles().some((role) => role.toUpperCase() === 'ADMIN');
    const securityItems = (isAdmin ? this.securityNavigation : [])
      .filter((item) => this.session.canPermission(item.permission))
      .map(({ permission: _permission, ...item }) => item);

    return [
      ...(operationItems.length ? [{ label: 'Operación', items: operationItems }] : []),
      ...(securityItems.length ? [{ label: 'Seguridad', items: securityItems }] : []),
    ];
  });

  protected onMenuToggle(): void {
    if (this.isDesktop()) {
      this.sidebarCollapsed.update((v) => !v);
      return;
    }
    this.mobileOpen.set(true);
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => void this.router.navigate(['/login']),
      error: () => void this.router.navigate(['/login']),
    });
  }
}