import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SaleLine } from '../../../core/models/sale.model';
import { toApiMessage } from '../../../core/utils/to-api-message';
import { filterRows } from '../../../core/utils/filter-rows';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { ProductSaleApi } from '../product-sale-api';

export type FlattenedSaleLine = SaleLine & { saleId: number };

@Component({
  selector: 'app-product-sale-list',
  standalone: true,
  imports: [
    ButtonModule,
    CurrencyPipe,
    InputTextModule,
    MessageModule,
    PageHeader,
    RouterLink,
    TableModule,
    TagModule,
    EmptyState,
  ],
  templateUrl: './product-sale-list.html',
  styleUrl: './product-sale-list.css',
  host: { class: 'block' },
})
export class ProductSaleList {
  private readonly api = inject(ProductSaleApi);

  readonly rows = signal<FlattenedSaleLine[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');

  readonly totalUnits = computed(() =>
    this.rows().reduce((acc, row) => acc + row.quantity, 0)
  );

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (item) => [
      item.saleId,
      item.productName,
      item.unitPrice,
      item.lineTotal,
    ])
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.list().subscribe({
      next: (lines) => {
        const flattened = lines as FlattenedSaleLine[];
        this.rows.set(flattened);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.rows.set([]);
        this.error.set(toApiMessage(err));
        this.loading.set(false);
      },
    });
  }
}
