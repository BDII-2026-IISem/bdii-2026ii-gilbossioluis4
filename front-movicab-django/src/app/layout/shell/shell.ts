import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { DrawerModule } from 'primeng/drawer';
import { ToastModule } from 'primeng/toast';
import { watchMediaQuery } from '../../core/utils/media-query';
import { Aside } from '../aside/aside';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';

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

  readonly sidebarCollapsed = signal(false);
  readonly mobileOpen = signal(false);

  readonly items: MenuItem[] = [
    { label: 'Clientes / Pasajeros', icon: 'pi pi-users', routerLink: '/clientes' },
    { label: 'Tipos de producto', icon: 'pi pi-tags', routerLink: '/tipos-producto' },
    { label: 'Productos / Servicios', icon: 'pi pi-box', routerLink: '/productos' },
    { label: 'Ventas / Despacho', icon: 'pi pi-shopping-cart', routerLink: '/ventas' },
    { label: 'Detalle de Ventas', icon: 'pi pi-list', routerLink: '/detalle-ventas' },
    { label: 'Dashboard', icon: 'pi pi-chart-bar', routerLink: '/dashboard' },
  ];

  protected onMenuToggle(): void {
    if (this.isDesktop()) {
      this.sidebarCollapsed.update((v) => !v);
      return;
    }
    this.mobileOpen.set(true);
  }
}