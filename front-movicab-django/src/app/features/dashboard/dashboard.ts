import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Client } from '../../core/models/client.model';
import { Product } from '../../core/models/product.model';
import { Sale } from '../../core/models/sale.model';
import { toApiMessage } from '../../core/utils/to-api-message';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { SaleApi } from '../sales/sale-api';
import { ProductApi } from '../products/product-api';
import { ClientApi } from '../clients/client-api';

function sameDay(iso: string, reference: Date): boolean {
  if (!iso) return false;
  const date = new Date(iso);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    ButtonModule,
    CurrencyPipe,
    EmptyState,
    MessageModule,
    PageHeader,
    TableModule,
    TagModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  host: { class: 'block' },
})
export class Dashboard {
  private readonly saleApi = inject(SaleApi);
  private readonly productApi = inject(ProductApi);
  private readonly clientApi = inject(ClientApi);

  readonly sales = signal<Sale[]>([]);
  readonly products = signal<Product[]>([]);
  readonly clients = signal<Client[]>([]);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly todaySales = computed(() => {
    const today = new Date();
    return this.sales().filter((s) => s.status === 'active' && sameDay(s.saleDate, today));
  });

  readonly todayTotal = computed(() =>
    this.todaySales().reduce((acc, s) => acc + (Number(s.total) || 0), 0)
  );

  readonly lowStockProducts = computed(() =>
    this.products().filter((p) => p.status === 'active' && p.quantity <= p.minStock)
  );

  readonly activeClientsCount = computed(() => this.clients().length);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      sales: this.saleApi.list(),
      products: this.productApi.list('active'),
      clients: this.clientApi.list(),
    }).subscribe({
      next: ({ sales, products, clients }) => {
        this.sales.set(sales);
        this.products.set(products);
        this.clients.set(clients);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(toApiMessage(err));
        this.loading.set(false);
      },
    });
  }
}
