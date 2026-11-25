import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormRecord, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { DomainApi, DomainRecord } from './domain-api';
import { DomainColumn, DomainDefinition, DomainField, DomainOption } from './domain-config';
import { NotificationService } from '../../core/services/notification';
import { SessionStore } from '../../core/services/session-store';
import { toApiMessage } from '../../core/utils/to-api-message';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { PageHeader } from '../../shared/ui/page-header/page-header';

const NAME_COLLATOR = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

@Component({
  selector: 'app-domain-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    MessageModule,
    TooltipModule,
    HasPermissionDirective,
    PageHeader,
  ],
  providers: [ConfirmationService],
  templateUrl: './domain-page.html',
  styleUrl: './domain-page.css',
  host: { class: 'block' },
})
export class DomainPage {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(DomainApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly session = inject(SessionStore);

  readonly definition = this.route.snapshot.data['domain'] as DomainDefinition;
  readonly createPermission = `POST /api/${this.definition.path}/`;
  readonly updatePermission = `PATCH /api/${this.definition.path}/:id/`;
  readonly deletePermission = `DELETE /api/${this.definition.path}/:id/`;
  readonly careerStatusPermission = 'PATCH /api/carreras/:id/estado/';
  readonly rows = signal<DomainRecord[]>([]);
  readonly options = signal<Record<string, DomainRecord[]>>({});
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');
  readonly statusFilter = signal('all');
  readonly sortOrder = signal<'asc' | 'desc'>('asc');
  readonly dialogVisible = signal(false);
  readonly editing = signal<DomainRecord | null>(null);
  readonly detailVisible = signal(false);
  readonly selectedRecord = signal<DomainRecord | null>(null);
  readonly form = new FormRecord<FormControl<unknown>>({});

  readonly statusKey = computed(
    () => this.definition.columns.find((column) => ['isActive', 'status', 'estado'].includes(column.key))?.key ?? null,
  );
  readonly statusOptions = computed(() => {
    const key = this.statusKey();
    if (!key) return [];
    const values = new Map<string, string>();
    for (const row of this.rows()) {
      const value = row[key];
      if (value == null || value === '') continue;
      const optionValue = String(value);
      values.set(optionValue, typeof value === 'boolean' ? (value ? 'Activo' : 'Inactivo') : this.displayValue(value));
    }
    return [...values.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((left, right) => NAME_COLLATOR.compare(left.label, right.label));
  });
  readonly visibleRows = computed(() => {
    const query = this.filter().trim().toLocaleLowerCase();
    const selectedStatus = this.statusFilter();
    const statusKey = this.statusKey();
    const direction = this.sortOrder() === 'asc' ? 1 : -1;
    return this.rows()
      .filter((row) => {
        const matchesName = !query || this.nameValue(row).toLocaleLowerCase().includes(query);
        const matchesStatus = selectedStatus === 'all'
          || !statusKey
          || String(row[statusKey]) === selectedStatus;
        return matchesName && matchesStatus;
      })
      .sort((left, right) => direction * NAME_COLLATOR.compare(this.nameValue(left), this.nameValue(right)));
  });

  constructor() {
    this.load();
    this.loadOptions();
  }

  control(field: DomainField): FormControl<unknown> {
    return this.form.controls[field.key];
  }

  fieldOptions(field: DomainField): DomainOption[] {
    if (field.options) return field.options;
    return field.optionPath ? this.options()[field.optionPath] ?? [] : [];
  }

  optionLabel(field: DomainField, option: DomainOption): string {
    const value = field.optionLabel ? option[field.optionLabel] : option['nombre'];
    return value == null ? `#${option['id']}` : String(value);
  }

  displayValue(value: unknown, column?: DomainColumn): string {
    if (typeof value === 'boolean') return value ? 'Activo' : 'Inactivo';
    if (Array.isArray(value)) return value.join(', ');
    if (value == null || value === '') return '—';
    if (column?.format === 'cop' && Number.isFinite(Number(value))) {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        currencyDisplay: 'code',
        maximumFractionDigits: 0,
      }).format(Number(value));
    }
    if (column?.format === 'datetime') {
      const date = new Date(String(value));
      if (!Number.isNaN(date.getTime())) {
        return new Intl.DateTimeFormat('es-CO', {
          dateStyle: 'short',
          timeStyle: 'short',
          timeZone: 'America/Bogota',
        }).format(date);
      }
    }
    return String(value);
  }

  private nameValue(row: DomainRecord): string {
    const nameColumn = this.definition.columns.find((column) =>
      /nombre|name|username|razonSocial|detalle|nit/i.test(column.key),
    );
    const value = nameColumn ? row[nameColumn.key] : row[this.definition.columns[0]?.key ?? 'id'];
    return value == null ? String(row['id']) : this.displayValue(value, nameColumn);
  }

  isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.list<DomainRecord>(this.definition.path).subscribe({
      next: (rows) => {
        this.rows.set(rows);
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
    this.openForm(null);
  }

  openEdit(row: DomainRecord): void {
    this.openForm(row);
  }

  showTripDetails(row: DomainRecord): void {
    this.selectedRecord.set(row);
    this.detailVisible.set(true);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.payload();
    const current = this.editing();
    const requiredPermission = current ? this.updatePermission : this.createPermission;
    if (!this.session.canPermission(requiredPermission)) {
      this.notify.error('Acceso denegado', 'Tu sesión no tiene permiso para guardar este registro.');
      return;
    }
    this.saving.set(true);
    const request = current
      ? this.api.update<DomainRecord>(this.definition.path, current.id, payload)
      : this.api.create<DomainRecord>(this.definition.path, payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(current ? 'Registro actualizado' : 'Registro creado');
        this.load();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo guardar', toApiMessage(err));
      },
    });
  }

  remove(row: DomainRecord): void {
    if (!this.session.canPermission(this.deletePermission)) {
      this.notify.error('Acceso denegado', 'Tu sesión no tiene permiso para dar de baja este registro.');
      return;
    }
    this.confirmation.confirm({
      header: 'Confirmar baja',
      message: `¿Dar de baja el registro #${row.id}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Dar de baja',
      rejectLabel: 'Cancelar',
      accept: () =>
        this.api.remove(this.definition.path, row.id).subscribe({
          next: () => {
            this.notify.warn('Registro dado de baja');
            this.load();
          },
          error: (err: unknown) => this.notify.error('No se pudo dar de baja', toApiMessage(err)),
        }),
    });
  }

  transitionCareer(row: DomainRecord, estado: string): void {
    if (!this.session.canPermission(this.careerStatusPermission)) {
      this.notify.error('Acceso denegado', 'Tu sesión no tiene permiso para cambiar el estado de la carrera.');
      return;
    }
    this.saving.set(true);
    this.api.updateCareerStatus(row.id, estado).subscribe({
      next: () => {
        this.saving.set(false);
        this.notify.success(estado === 'FINALIZADA' ? 'Carrera finalizada' : 'Carrera iniciada');
        this.load();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo actualizar la carrera', toApiMessage(err));
      },
    });
  }

  private loadOptions(): void {
    const paths = [...new Set(this.definition.fields.map((field) => field.optionPath).filter((path): path is string => !!path))];
    for (const path of paths) {
      this.api.list<DomainRecord>(path).subscribe({
        next: (rows) => this.options.update((current) => ({ ...current, [path]: rows })),
        error: (err: unknown) =>
          this.notify.error('No se pudieron cargar las opciones', toApiMessage(err)),
      });
    }
  }

  private openForm(row: DomainRecord | null): void {
    this.editing.set(row);
    this.form.controls && Object.keys(this.form.controls).forEach((key) => this.form.removeControl(key));

    for (const field of this.definition.fields) {
      const value = row ? this.initialValue(field, row) : this.defaultValue(field);
      const validators = field.required || (field.requiredOnCreate && !row)
        ? [Validators.required]
        : [];
      this.form.addControl(field.key, new FormControl<unknown>(value, validators));
    }
    this.dialogVisible.set(true);
  }

  private defaultValue(field: DomainField): unknown {
    if (field.type === 'checkbox') return true;
    if (field.type === 'multiselect') return [];
    if (field.key === 'estado') return 'ACEPTADA';
    return '';
  }

  private initialValue(field: DomainField, row: DomainRecord): unknown {
    let value = row[field.key];
    if (field.type === 'select' && value != null) return String(value);
    if (field.type === 'datetime' && value) {
      const date = new Date(String(value));
      if (!Number.isNaN(date.getTime())) {
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        value = date.toISOString().slice(0, 16);
      }
    }
    if (field.type === 'multiselect') return Array.isArray(value) ? value : [];
    return value ?? (field.type === 'checkbox' ? false : '');
  }

  private payload(): Record<string, unknown> {
    const raw = this.form.getRawValue();
    const payload: Record<string, unknown> = {};
    for (const field of this.definition.fields) {
      let value = raw[field.key];
      if (field.writeOnly && (value == null || value === '')) continue;
      if (field.type === 'datetime') {
        value = value ? new Date(String(value)).toISOString() : null;
      } else if (field.type === 'number' || (field.type === 'select' && field.valueType === 'number')) {
        value = value === '' || value == null ? null : Number(value);
      } else if (field.type === 'multiselect') {
        value = Array.isArray(value) ? value.map(Number) : [];
      } else if (value === '') {
        value = null;
      }
      payload[field.key] = value;
    }
    return payload;
  }
}
