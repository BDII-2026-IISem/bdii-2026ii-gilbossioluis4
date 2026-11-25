import { Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { Pasajero, PasajeroPayload } from '../../../core/models/pasajero.model';

@Component({
  selector: 'app-pasajero-form',
  standalone: true,
  imports: [ButtonModule, InputTextModule, MessageModule, ReactiveFormsModule, TextareaModule],
  templateUrl: './client-form.html',
  styleUrl: './client-form.css',
  host: { class: 'block' },
})
export class PasajeroForm {
  readonly pasajero = input<Pasajero | null>(null);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<PasajeroPayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    email: ['', [Validators.email, Validators.maxLength(150)]],
    descripcion: ['', [Validators.maxLength(255)]],
  });

  constructor() {
    effect(() => {
      const current = this.pasajero();
      this.resetKey();
      this.form.reset({
        nombre: current?.nombre ?? '',
        email: current?.email ?? '',
        descripcion: current?.descripcion ?? '',
      });
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.saved.emit({
      nombre: value.nombre.trim(),
      email: value.email.trim() || null,
      descripcion: value.descripcion.trim() || null,
    });
  }
}
