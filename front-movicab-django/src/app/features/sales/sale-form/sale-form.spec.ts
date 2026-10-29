import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { SaleForm } from './sale-form';
import { Product } from '../../../core/models/product.model';

const PRODUCTO: Product = {
  id: 10,
  productTypeId: 1,
  name: 'Servicio Urbano',
  brand: 'MoviCab',
  price: '15.00',
  minStock: 1,
  quantity: 5,
  status: 'active',
};

describe('SaleForm', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleForm],
      providers: [
        provideNoopAnimations(),
        providePrimeNG({ theme: { preset: Aura } }),
      ],
    }).compileComponents();
  }, 30000);

  it('should prevent adding duplicate line for same product', async () => {
    const fixture = TestBed.createComponent(SaleForm);
    fixture.componentRef.setInput('products', [PRODUCTO]);
    fixture.detectChanges();
    await fixture.whenStable();

    const comp = fixture.componentInstance;
    comp.selectedProductId.set(10);
    comp.selectedQuantity.set(2);
    comp.addLine();

    expect(comp.lines().length).toBe(1);

    comp.selectedProductId.set(10);
    comp.selectedQuantity.set(1);
    comp.addLine();

    expect(comp.lines().length).toBe(1);
    expect(comp.draftError()).toBe('El producto ya está en la venta.');
  }, 15000);
});
