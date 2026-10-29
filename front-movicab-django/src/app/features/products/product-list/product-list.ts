import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Product, ProductPayload } from '../../../core/models/product.model';
import { ProductType } from '../../../core/models/product-type.model';
import { NotificationService } from '../../../core/services/notification';
import { toApiMessage } from '../../../core/utils/to-api-message';
import { filterRows } from '../../../core/utils/filter-rows';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { ProductApi } from '../product-api';
import { ProductTypeApi } from '../../product-types/product-type-api';
import { ProductForm } from '../product-form/product-form';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    ButtonModule,
    ConfirmDialogModule,
    CurrencyPipe,
    DialogModule,
    EmptyState,
    InputTextModule,
    MessageModule,
    PageHeader,
    StatusTag,
    TableModule,
    TagModule,
    TooltipModule,
    ProductForm,
  ],
  providers: [ConfirmationService],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
  host: { class: 'block' },
})
export class ProductList {
  private readonly api = inject(ProductApi);
  private readonly typeApi = inject(ProductTypeApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<Product[]>([]);
  readonly productTypes = signal<ProductType[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');
  readonly onlyAvailable = signal(false);
  readonly dialogVisible = signal(false);
  readonly editing = signal<Product | null>(null);
  readonly resetKey = signal(0);

  readonly lowStock = computed(
    () => new Set(this.rows().filter((r) => r.quantity <= r.minStock).map((r) => r.id))
  );

  readonly lowStockCount = computed(
    () => this.rows().filter((r) => r.quantity <= r.minStock).length
  );

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (p) => [p.name, p.brand, p.productTypeName])
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    const products$ = this.onlyAvailable()
      ? this.api.available()
      : this.api.list('active');

    forkJoin({
      products: products$,
      types: this.typeApi.list('active'),
    }).subscribe({
      next: ({ products, types }) => {
        this.rows.set(products);
        this.productTypes.set(types);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.rows.set([]);
        this.error.set(toApiMessage(err));
        this.loading.set(false);
      },
    });
  }

  toggleAvailable(): void {
    this.onlyAvailable.update((v) => !v);
    this.load();
  }

  openCreate(): void {
    this.editing.set(null);
    this.resetKey.update((k) => k + 1);
    this.dialogVisible.set(true);
  }

  openEdit(product: Product): void {
    this.editing.set(product);
    this.resetKey.update((k) => k + 1);
    this.dialogVisible.set(true);
  }

  save(payload: ProductPayload): void {
    const current = this.editing();
    this.saving.set(true);
    const request = current
      ? this.api.update(current.id, payload)
      : this.api.create({ ...payload, status: 'active' });

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(current ? 'Producto actualizado' : 'Producto creado');
        this.load();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo guardar', toApiMessage(err));
      },
    });
  }

  remove(product: Product): void {
    this.confirmation.confirm({
      header: 'Dar de baja',
      message: `¿Desactivar el producto «${product.name}»?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desactivar',
      rejectLabel: 'Cancelar',
      accept: () =>
        this.api.remove(product.id).subscribe({
          next: () => {
            this.notify.warn('Producto desactivado');
            this.load();
          },
          error: (err: unknown) =>
            this.notify.error('No se pudo desactivar', toApiMessage(err)),
        }),
    });
  }
}
