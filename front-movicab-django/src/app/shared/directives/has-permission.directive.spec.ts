import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SessionStore } from '../../core/services/session-store';
import { HasPermissionDirective } from './has-permission.directive';

@Component({
  imports: [HasPermissionDirective],
  template: `<button *appHasPermission="'POST /api/pasajeros/'">Nuevo pasajero</button>`,
})
class PermissionHost {}

describe('HasPermissionDirective', () => {
  it('actualiza la vista al cambiar la matriz de permisos', async () => {
    const allowed = signal(false);
    await TestBed.configureTestingModule({
      imports: [PermissionHost],
      providers: [{
        provide: SessionStore,
        useValue: { canPermission: () => allowed() },
      }],
    }).compileComponents();

    const fixture = TestBed.createComponent(PermissionHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();

    allowed.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Nuevo pasajero');
  });
});
