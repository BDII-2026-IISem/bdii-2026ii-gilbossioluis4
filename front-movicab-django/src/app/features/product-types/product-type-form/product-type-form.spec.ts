import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { ProductTypeForm } from './product-type-form';
import { ProductTypePayload } from '../../../core/models/product-type.model';

describe('ProductTypeForm', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductTypeForm],
      providers: [
        provideNoopAnimations(),
        providePrimeNG({ theme: { preset: Aura } }),
      ],
    }).compileComponents();
  }, 30000);

  it('should emit saved with trimmed name and null description when empty', async () => {
    const fixture = TestBed.createComponent(ProductTypeForm);
    fixture.detectChanges();
    await fixture.whenStable();

    let payload: ProductTypePayload | undefined;
    fixture.componentInstance.saved.subscribe((p) => (payload = p));
    fixture.componentInstance.form.setValue({
      name: ' Ejecutivo ',
      description: '  ',
    });
    fixture.componentInstance.submit();

    expect(payload).toEqual({
      name: 'Ejecutivo',
      description: null,
    });
  }, 15000);
});
