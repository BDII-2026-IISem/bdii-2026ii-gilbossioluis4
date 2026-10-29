import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { Product } from '../../../core/models/product.model';
import { ProductApi } from '../product-api';
import { ProductTypeApi } from '../../product-types/product-type-api';
import { NotificationService } from '../../../core/services/notification';
import { ProductList } from './product-list';

const PRODUCTO_OK: Product = {
  id: 1,
  productTypeId: 1,
  productTypeName: 'Ejecutivo',
  name: 'Carrera Urbana',
  brand: 'MoviCab',
  price: '15.00',
  minStock: 2,
  quantity: 10,
  status: 'active',
};

const PRODUCTO_LOW: Product = {
  id: 2,
  productTypeId: 1,
  productTypeName: 'Ejecutivo',
  name: 'Servicio Especial',
  brand: 'MoviCab',
  price: '25.00',
  minStock: 5,
  quantity: 0,
  status: 'active',
};

describe('ProductList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductList],
      providers: [
        ConfirmationService,
        MessageService,
        provideNoopAnimations(),
        providePrimeNG({ theme: { preset: Aura } }),
        {
          provide: ProductApi,
          useValue: {
            list: () => of([PRODUCTO_OK, PRODUCTO_LOW]),
            available: () => of([PRODUCTO_OK]),
          },
        },
        {
          provide: ProductTypeApi,
          useValue: { list: () => of([]) },
        },
        {
          provide: NotificationService,
          useValue: { success() {}, warn() {}, error() {} },
        },
      ],
    }).compileComponents();
  }, 30000);

  it('should mark low stock products in lowStock set', async () => {
    const fixture = TestBed.createComponent(ProductList);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(component.lowStock().has(2)).toBe(true);
    expect(component.lowStock().has(1)).toBe(false);
    expect(component.lowStockCount()).toBe(1);
  }, 15000);
});
