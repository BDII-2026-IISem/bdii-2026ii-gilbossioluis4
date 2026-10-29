import { Component, computed, effect, input, output, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Client } from '../../../core/models/client.model';
import { Product } from '../../../core/models/product.model';
import { SaleCreatePayload } from '../../../core/models/sale.model';
import { toIsoWithOffset } from '../sale-date';

export interface DraftLine {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  maxStock: number;
}

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [
    ButtonModule,
    CurrencyPipe,
    FormsModule,
    InputNumberModule,
    MessageModule,
    SelectModule,
    TableModule,
  ],
  templateUrl: './sale-form.html',
  styleUrl: './sale-form.css',
  host: { class: 'block' },
})
export class SaleForm {
  readonly clients = input<Client[]>([]);
  readonly products = input<Product[]>([]);
  readonly resetKey = input(0);
  readonly saving = input(false);
  readonly serverError = input<string | null>(null);

  readonly saved = output<SaleCreatePayload>();
  readonly cancelled = output<void>();

  readonly clientId = signal<number | null>(null);
  readonly discounts = signal<number>(0);
  readonly selectedProductId = signal<number | null>(null);
  readonly selectedQuantity = signal<number>(1);
  readonly lines = signal<DraftLine[]>([]);
  readonly draftError = signal<string | null>(null);

  readonly subtotal = computed(() =>
    this.lines().reduce((acc, line) => acc + line.lineTotal, 0)
  );

  readonly previewTotal = computed(() => {
    const total = this.subtotal() - (this.discounts() || 0);
    return total > 0 ? total : 0;
  });

  constructor() {
    effect(() => {
      this.resetKey();
      this.clientId.set(null);
      this.discounts.set(0);
      this.selectedProductId.set(null);
      this.selectedQuantity.set(1);
      this.lines.set([]);
      this.draftError.set(null);
    });
  }

  addLine(): void {
    this.draftError.set(null);
    const prodId = this.selectedProductId();
    const qty = Math.floor(this.selectedQuantity());

    if (!prodId) {
      this.draftError.set('Selecciona un producto o servicio.');
      return;
    }

    if (qty < 1) {
      this.draftError.set('La cantidad debe ser al menos 1.');
      return;
    }

    const product = this.products().find((p) => p.id === prodId);
    if (!product) {
      this.draftError.set('Producto no disponible.');
      return;
    }

    if (this.lines().some((l) => l.productId === prodId)) {
      this.draftError.set('El producto ya está en la venta.');
      return;
    }

    if (qty > product.quantity) {
      this.draftError.set(
        `La cantidad (${qty}) supera el stock disponible (${product.quantity}).`
      );
      return;
    }

    const priceNum = Number(product.price) || 0;
    const newLine: DraftLine = {
      productId: product.id,
      productName: product.name,
      unitPrice: priceNum,
      quantity: qty,
      lineTotal: priceNum * qty,
      maxStock: product.quantity,
    };

    this.lines.update((current) => [...current, newLine]);
    this.selectedProductId.set(null);
    this.selectedQuantity.set(1);
  }

  removeLine(productId: number): void {
    this.lines.update((current) => current.filter((l) => l.productId !== productId));
  }

  submit(): void {
    this.draftError.set(null);

    if (!this.clientId()) {
      this.draftError.set('Debes seleccionar un cliente.');
      return;
    }

    if (this.lines().length === 0) {
      this.draftError.set('Debes agregar al menos un producto a la venta.');
      return;
    }

    const payload: SaleCreatePayload = {
      clientId: Number(this.clientId()),
      saleDate: toIsoWithOffset(new Date()),
      discounts: (this.discounts() || 0).toFixed(2),
      items: this.lines().map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
      })),
    };

    this.saved.emit(payload);
  }
}
