import { TestBed } from '@angular/core/testing';
import { ClientForm } from './client-form';
import { ClientPayload } from '../../../core/models/client.model';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

describe('ClientForm', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientForm],
      providers: [
        provideNoopAnimations(),
        providePrimeNG({ theme: { preset: Aura } }),
      ],
    }).compileComponents();
  }, 30000);

  it('should emit saved with the trimmed body', async () => {
    const fixture = TestBed.createComponent(ClientForm);
    fixture.detectChanges();
    await fixture.whenStable();

    let body: ClientPayload | undefined;
    fixture.componentInstance.saved.subscribe((p) => (body = p));
    fixture.componentInstance.form.setValue({
      name: ' Ana Torres ',
      phone: '',
      email: '',
      address: '',
    });
    fixture.componentInstance.submit();

    expect(body).toEqual({
      name: 'Ana Torres',
      phone: null,
      email: null,
      address: null,
    });
  }, 15000);
});
