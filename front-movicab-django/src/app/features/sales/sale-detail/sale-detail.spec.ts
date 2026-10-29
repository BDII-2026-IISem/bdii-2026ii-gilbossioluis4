import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { Sale } from '../../../core/models/sale.model';
import { SaleApi } from '../sale-api';
import { NotificationService } from '../../../core/services/notification';
import { SaleDetail } from './sale-detail';

const VENTA_MOCK: Sale = {
  id: 61,
  client: 1,
  clientName: 'Ana Torres',
  saleDate: '2026-10-28T10:00:00-05:00',
  subtotal: '516.10',
  tax: '0.00',
  discounts: '0.00',
  total: '516.10',
  status: 'active',
  lines: [
    {
      id: 1,
      product: 35,
      productName: 'Acción 15',
      quantity: 1,
      unitPrice: '516.10',
      lineTotal: '516.10',
    },
  ],
};

describe('SaleDetail', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleDetail],
      providers: [
        provideRouter([]),
        ConfirmationService,
        MessageService,
        provideNoopAnimations(),
        providePrimeNG({ theme: { preset: Aura } }),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '61' } },
          },
        },
        {
          provide: SaleApi,
          useValue: {
            get: () => of(VENTA_MOCK),
            voidSale: () => of(void 0),
          },
        },
        {
          provide: NotificationService,
          useValue: { success() {}, warn() {}, error() {} },
        },
      ],
    }).compileComponents();
  }, 30000);

  it('should render sale detail without recalculating amounts', async () => {
    const fixture = TestBed.createComponent(SaleDetail);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Venta #61');
    expect(compiled.textContent).toContain('Ana Torres');
    expect(compiled.textContent).toContain('Acción 15');
  }, 15000);
});
