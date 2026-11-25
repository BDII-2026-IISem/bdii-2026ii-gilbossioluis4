import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { MessageService } from 'primeng/api';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { AuthService } from '../../core/services/auth';
import { SessionStore } from '../../core/services/session-store';
import { Shell } from './shell';

describe('Shell', () => {
  const permissions = signal(new Set(['GET /api/pasajeros/', 'GET /api/roles/']));

  beforeEach(async () => {
    permissions.set(new Set(['GET /api/pasajeros/', 'GET /api/roles/']));
    await TestBed.configureTestingModule({
      imports: [Shell],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        providePrimeNG({ theme: { preset: Aura } }),
        MessageService,
        {
          provide: SessionStore,
          useValue: {
            canPermission: (permission: string) => permissions().has(permission),
            user: signal({ username: 'admin' }),
            roles: signal(['ADMIN']),
            permissionCount: signal(2),
          },
        },
        { provide: AuthService, useValue: { logout: () => of(undefined) } },
      ]
    }).compileComponents();
  });

  it('debe crear el Shell con sus componentes de Layout', async () => {
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
    expect(compiled.querySelector('app-footer')).toBeTruthy();
  }, 15000);

  it('filtra los grupos de menú según los permisos concedidos', () => {
    const fixture = TestBed.createComponent(Shell);
    expect(fixture.componentInstance.items().map((group) => group.label))
      .toEqual(['Operación', 'Seguridad']);

    permissions.set(new Set(['GET /api/pasajeros/']));
    expect(fixture.componentInstance.items()).toEqual([
      expect.objectContaining({
        label: 'Operación',
        items: [expect.objectContaining({ label: 'Pasajeros' })],
      }),
    ]);
  });
});
