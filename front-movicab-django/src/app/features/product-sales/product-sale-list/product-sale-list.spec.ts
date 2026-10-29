import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { ProductSaleApi } from '../product-sale-api';
import { ProductSaleList } from './product-sale-list';

describe('ProductSaleList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductSaleList],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        providePrimeNG({ theme: { preset: Aura } }),
        {
          provide: ProductSaleApi,
          useValue: {
            list: () =>
              of([
                {
                  id: 1,
                  saleId: 61,
                  product: 35,
                  productName: 'Acción 15',
                  quantity: 1,
                  unitPrice: '516.10',
                  lineTotal: '516.10',
                },
              ]),
          },
        },
      ],
    }).compileComponents();
  });

  it('should render flattened lines with link to sale', async () => {
    const fixture = TestBed.createComponent(ProductSaleList);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('tbody tr').length).toBe(1);
    expect(compiled.textContent).toContain('#61');
    expect(compiled.textContent).toContain('Acción 15');
  });
});
