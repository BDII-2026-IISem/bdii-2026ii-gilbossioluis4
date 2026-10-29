import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { ProductType } from '../../../core/models/product-type.model';
import { ProductTypeApi } from '../product-type-api';
import { NotificationService } from '../../../core/services/notification';
import { ProductTypeList } from './product-type-list';

const TIPO: ProductType = {
  id: 1,
  name: 'Ejecutivo',
  description: 'Servicio VIP',
  status: 'active',
};

describe('ProductTypeList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductTypeList],
      providers: [
        ConfirmationService,
        MessageService,
        provideNoopAnimations(),
        providePrimeNG({ theme: { preset: Aura } }),
        {
          provide: ProductTypeApi,
          useValue: { list: () => of([TIPO]) },
        },
        {
          provide: NotificationService,
          useValue: { success() {}, warn() {}, error() {} },
        },
      ],
    }).compileComponents();
  });

  it('should render active product types in table', async () => {
    const fixture = TestBed.createComponent(ProductTypeList);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('tbody tr').length).toBe(1);
    expect(compiled.textContent).toContain('Ejecutivo');
  });
});
