import { TestBed } from '@angular/core/testing';
import { PasajeroForm } from './client-form';
import { PasajeroPayload } from '../../../core/models/pasajero.model';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

describe('ClientForm', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasajeroForm],
      providers: [
        provideNoopAnimations(),
        providePrimeNG({ theme: { preset: Aura } }),
      ],
    }).compileComponents();
  }, 30000);

  it('should emit saved with the trimmed body', async () => {
    const fixture = TestBed.createComponent(PasajeroForm);
    fixture.detectChanges();
    await fixture.whenStable();

    let body: PasajeroPayload | undefined;
    fixture.componentInstance.saved.subscribe((p) => (body = p));
    fixture.componentInstance.form.setValue({
      nombre: ' Ana Torres ',
      email: '',
      descripcion: '',
    });
    fixture.componentInstance.submit();

    expect(body).toEqual({
      nombre: 'Ana Torres',
      email: null,
      descripcion: null,
    });
  }, 15000);
});
