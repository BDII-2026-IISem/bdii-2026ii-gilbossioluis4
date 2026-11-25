import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification';
import { SessionStore } from '../../../core/services/session-store';
import { toApiMessage } from '../../../core/utils/to-api-message';
import { PageHeader } from '../../../shared/ui/page-header/page-header';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ButtonModule, CardModule, InputTextModule, PageHeader, ReactiveFormsModule, TagModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  host: { class: 'block' },
})
export class Profile {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);
  readonly session = inject(SessionStore);

  readonly refreshing = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly form = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    currentPassword: [''],
    newPassword: [''],
    confirmPassword: [''],
  });

  constructor() {
    this.syncForm();
  }

  refresh(): void {
    this.refreshing.set(true);
    this.auth.me().subscribe({
      next: (user) => {
        this.form.patchValue({ username: user.username, email: user.email });
        this.refreshing.set(false);
        this.notify.success('Sesión sincronizada');
      },
      error: () => this.refreshing.set(false),
    });
  }

  saveProfile(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { username, email, currentPassword, newPassword, confirmPassword } = this.form.getRawValue();
    if (newPassword && newPassword !== confirmPassword) {
      this.error.set('La confirmación de contraseña no coincide.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.auth.updateProfile({
      username: username.trim(),
      email: email.trim(),
      currentPassword,
      newPassword,
    }).subscribe({
      next: (user) => {
        this.saving.set(false);
        this.form.patchValue({
          username: user.username,
          email: user.email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        this.notify.success('Perfil actualizado');
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.error.set(toApiMessage(error));
      },
    });
  }

  private syncForm(): void {
    this.form.patchValue({
      username: this.session.user()?.username ?? '',
      email: this.session.user()?.email ?? '',
    });
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => {
        this.notify.info('Sesión cerrada');
        void this.router.navigate(['/login']);
      },
      error: () => {
        this.notify.warn('Sesión local cerrada', 'No se pudo confirmar la revocación en el servidor.');
        void this.router.navigate(['/login']);
      },
    });
  }
}
