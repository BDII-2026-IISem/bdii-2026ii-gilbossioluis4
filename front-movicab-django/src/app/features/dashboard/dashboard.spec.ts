import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { SaleApi } from '../sales/sale-api';
import { ProductApi } from '../products/product-api';
import { ClientApi } from '../clients/client-api';
import { Dashboard } from './dashboard';

const todayIso = new Date().toISOString();

describe('Dashboard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideNoopAnimations(),
        providePrimeNG({ theme: { preset: Aura } }),
        {
          provide: SaleApi,
          useValue: {
            list: () =>
              of([
                {
                  id: 1,
                  client: 1,
                  saleDate: todayIso,
                  subtotal: '100.00',
                  tax: '0.00',
                  discounts: '0.00',
                  total: '100.00',
                  status: 'active',
                },
              ]),
          },
        },
        {
          provide: ProductApi,
          useValue: {
            list: () =>
              of([
                {
                  id: 1,
                  productTypeId: 1,
                  name: 'P1',
                  brand: 'B1',
                  price: '10.00',
                  minStock: 5,
                  quantity: 2,
                  status: 'active',
                },
              ]),
          },
        },
        {
          provide: ClientApi,
          useValue: {
            list: () =>
              of([
                {
                  id: 1,
                  name: 'C1',
                  address: null,
                  phone: null,
                  email: null,
                  status: 'active',
                },
              ]),
          },
        },
      ],
    }).compileComponents();
  });

  it('should compute dashboard metrics correctly', async () => {
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    await fixture.whenStable();

    const comp = fixture.componentInstance;
    expect(comp.todaySales().length).toBe(1);
    expect(comp.todayTotal()).toBe(100);
    expect(comp.lowStockProducts().length).toBe(1);
    expect(comp.activeClientsCount()).toBe(1);
  });
});
