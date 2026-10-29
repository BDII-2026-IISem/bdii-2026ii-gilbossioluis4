import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';

@Component({
  selector: 'app-construir',
  standalone: true,
  imports: [ButtonModule, DrawerModule],
  templateUrl: './construir.html',
  styleUrl: './construir.css',
  host: { class: 'block' },
})
export class Construir {
  readonly title = signal('Inicio');
  readonly drawerVisible = signal(false);
  readonly asideVisible = signal(true);

  selectOption(name: string): void {
    this.title.set(name);
    this.drawerVisible.set(false);
  }

  toggleMenu(): void {
    this.drawerVisible.update((v) => !v);
    this.asideVisible.update((v) => !v);
  }
}
