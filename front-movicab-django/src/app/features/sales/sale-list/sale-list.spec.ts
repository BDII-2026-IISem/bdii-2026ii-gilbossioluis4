import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { Sale } from '../../../core/models/sale.model';
import { SaleApi } from '../sale-api';
import { ClientApi } from '../../clients/client-api';
import { ProductApi } from '../../products/product-api';
import { NotificationService } from '../../../core/services/notification';
import { SaleList } from './sale-list';

const VENTA_MOCK: Sale = {
  id: 1,
  client: 1,
  clientName: 'Ana Torres',
  saleDate: '2026-10-28T10:00:00-05:00',
  subtotal: '100.00',
  tax: '0.00',
  discounts: '0.00',
  total: '100.00',
  status: 'active',
};

describe('SaleList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleList],
      providers: [
        provideRouter([]),
        ConfirmationService,
        MessageService,
        provideNoopAnimations(),
        providePrimeNG({ theme: { preset: Aura } }),
        {
          provide: SaleApi,
          useValue: {
            list: () => of([VENTA_MOCK]),
          },
        },
        {
          provide: ClientApi,
          useValue: {
            list: () => of([]),
          },
        },
        {
          provide: ProductApi,
          useValue: {
            available: () => of([]),
          },
        },
        {
          provide: NotificationService,
          useValue: { success() {}, warn() {}, error() {} },
        },
      ],
    }).compileComponents();
  }, 30000);

  it('should render sales table correctly', async () => {
    const fixture = TestBed.createComponent(SaleList);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('tbody tr').length).toBe(1);
    expect(compiled.textContent).toContain('Ana Torres');
  }, 15000);
});
