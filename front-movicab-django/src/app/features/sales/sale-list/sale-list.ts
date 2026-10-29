import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Client } from '../../../core/models/client.model';
import { Product } from '../../../core/models/product.model';
import { Sale, SaleCreatePayload } from '../../../core/models/sale.model';
import { NotificationService } from '../../../core/services/notification';
import { toApiMessage } from '../../../core/utils/to-api-message';
import { filterRows } from '../../../core/utils/filter-rows';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { SaleApi } from '../sale-api';
import { ClientApi } from '../../clients/client-api';
import { ProductApi } from '../../products/product-api';
import { SaleForm } from '../sale-form/sale-form';

@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [
    ButtonModule,
    CurrencyPipe,
    DatePipe,
    DialogModule,
    EmptyState,
    InputTextModule,
    MessageModule,
    PageHeader,
    RouterLink,
    StatusTag,
    TableModule,
    TagModule,
    TooltipModule,
    SaleForm,
  ],
  templateUrl: './sale-list.html',
  styleUrl: './sale-list.css',
  host: { class: 'block' },
})
export class SaleList {
  private readonly api = inject(SaleApi);
  private readonly clientApi = inject(ClientApi);
  private readonly productApi = inject(ProductApi);
  private readonly notify = inject(NotificationService);

  readonly rows = signal<Sale[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly availableProducts = signal<Product[]>([]);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly serverError = signal<string | null>(null);
  readonly filter = signal('');
  readonly dialogVisible = signal(false);
  readonly resetKey = signal(0);

  readonly totalAvailableUnits = computed(() =>
    this.availableProducts().reduce((acc, p) => acc + p.quantity, 0)
  );

  readonly clientMap = computed(() => {
    const map = new Map<number, string>();
    for (const c of this.clients()) {
      map.set(c.id, c.name);
    }
    return map;
  });

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (s) => [
      s.id,
      s.clientName || this.clientMap().get(s.client),
      s.total,
    ])
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      sales: this.api.list(),
      clients: this.clientApi.list(),
      products: this.productApi.available(),
    }).subscribe({
      next: ({ sales, clients, products }) => {
        this.rows.set(sales);
        this.clients.set(clients);
        this.availableProducts.set(products);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.rows.set([]);
        this.error.set(toApiMessage(err));
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.serverError.set(null);
    this.resetKey.update((k) => k + 1);
    this.dialogVisible.set(true);
  }

  save(payload: SaleCreatePayload): void {
    this.saving.set(true);
    this.serverError.set(null);

    this.api.create(payload).subscribe({
      next: (created) => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(`Venta #${created.id} registrada con éxito`);
        this.load();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        const msg = toApiMessage(err);
        this.serverError.set(msg);
        this.notify.error('No se pudo registrar la venta', msg);
      },
    });
  }
}
