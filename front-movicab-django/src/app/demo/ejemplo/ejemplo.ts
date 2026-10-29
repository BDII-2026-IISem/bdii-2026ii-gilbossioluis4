import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  activo: boolean;
}

@Component({
  selector: 'app-ejemplo',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, TagModule, InputTextModule],
  templateUrl: './ejemplo.html',
  styleUrl: './ejemplo.css',
  host: { class: 'block' }
})
export class Ejemplo {
  readonly productoInicial: Producto = {
    id: 1,
    nombre: 'Café molido 500 g',
    precio: 18000,
    activo: true
  };

  readonly producto = signal<Producto>({ ...this.productoInicial });

  readonly precioFinal = computed(() => {
    return Math.round(this.producto().precio * 1.19);
  });

  readonly estadoTexto = computed(() => {
    return this.producto().activo ? 'Producto activo' : 'Producto inactivo (borrado lógico)';
  });

  constructor() {
    effect(() => {
      const p = this.producto();
      console.log(`[ejemplo] ${p.nombre} · $${p.precio} · ${p.activo ? 'activo' : 'inactivo'}`);
    });
  }

  variarPrecio(delta: number): void {
    this.producto.update(p => ({
      ...p,
      precio: Math.max(0, p.precio + delta)
    }));
  }

  conmutarEstado(): void {
    this.producto.update(p => ({
      ...p,
      activo: !p.activo
    }));
  }

  actualizarNombre(nuevoNombre: string): void {
    this.producto.update(p => ({
      ...p,
      nombre: nuevoNombre
    }));
  }

  reiniciar(): void {
    this.producto.set({ ...this.productoInicial });
  }
}