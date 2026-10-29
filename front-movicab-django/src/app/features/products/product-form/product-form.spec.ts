import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { ProductForm } from './product-form';
import { ProductPayload } from '../../../core/models/product.model';

describe('ProductForm', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductForm],
      providers: [
        provideNoopAnimations(),
        providePrimeNG({ theme: { preset: Aura } }),
      ],
    }).compileComponents();
  }, 30000);

  it('should emit saved with formatted payload and price with two decimals', async () => {
    const fixture = TestBed.createComponent(ProductForm);
    fixture.detectChanges();
    await fixture.whenStable();

    let payload: ProductPayload | undefined;
    fixture.componentInstance.saved.subscribe((p) => (payload = p));
    fixture.componentInstance.form.setValue({
      productTypeId: 1,
      name: ' Carrera ',
      brand: ' MoviCab ',
      price: 15,
      minStock: 2,
      quantity: 10,
    });
    fixture.componentInstance.submit();

    expect(payload).toEqual({
      productTypeId: 1,
      name: 'Carrera',
      brand: 'MoviCab',
      price: '15.00',
      minStock: 2,
      quantity: 10,
    });
  }, 15000);
});
