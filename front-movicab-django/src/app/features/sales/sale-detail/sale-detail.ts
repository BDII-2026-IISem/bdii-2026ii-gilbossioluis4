import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Sale } from '../../../core/models/sale.model';
import { NotificationService } from '../../../core/services/notification';
import { toApiMessage } from '../../../core/utils/to-api-message';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { SaleApi } from '../sale-api';

@Component({
  selector: 'app-sale-detail',
  standalone: true,
  imports: [
    ButtonModule,
    ConfirmDialogModule,
    CurrencyPipe,
    DatePipe,
    MessageModule,
    PageHeader,
    RouterLink,
    StatusTag,
    TableModule,
    TagModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './sale-detail.html',
  styleUrl: './sale-detail.css',
  host: { class: 'block' },
})
export class SaleDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(SaleApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly sale = signal<Sale | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly isVoided = computed(() => this.sale()?.status === 'inactive');

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    if (id) {
      this.load(id);
    } else {
      this.error.set('Identificador de venta no válido.');
      this.loading.set(false);
    }
  }

  load(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.get(id).subscribe({
      next: (s) => {
        this.sale.set(s);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.sale.set(null);
        this.error.set(toApiMessage(err));
        this.loading.set(false);
      },
    });
  }

  voidSale(): void {
    const current = this.sale();
    if (!current || this.isVoided()) return;

    const totalQty = current.lines?.reduce((acc, l) => acc + l.quantity, 0) || 0;

    this.confirmation.confirm({
      header: 'Anular venta',
      message: `¿Anular la venta #${current.id}? Devolverá ${totalQty} unidades al inventario y el estado pasará a Inactivo.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Anular venta',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.api.voidSale(current.id).subscribe({
          next: () => {
            this.notify.warn(`Venta #${current.id} anulada`);
            this.load(current.id);
          },
          error: (err: unknown) =>
            this.notify.error('No se pudo anular la venta', toApiMessage(err)),
        });
      },
    });
  }
}
