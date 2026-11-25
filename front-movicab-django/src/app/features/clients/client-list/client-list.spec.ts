import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { Pasajero } from '../../../core/models/pasajero.model';
import { PasajeroApi } from '../pasajero-api';
import { NotificationService } from '../../../core/services/notification';
import { PasajeroList } from './client-list';

const PASAJERO: Pasajero = {
  id: 1,
  nombre: 'Ana Torres',
  descripcion: 'Frecuente',
  email: 'ana@movicab.test',
  status: 'active',
};

describe('ClientList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasajeroList],
      providers: [
        ConfirmationService,
        MessageService,
        provideNoopAnimations(),
        providePrimeNG({ theme: { preset: Aura } }),
        {
          provide: PasajeroApi,
          useValue: { list: () => of([PASAJERO]) },
        },
        {
          provide: NotificationService,
          useValue: { success() {}, warn() {}, error() {} },
        },
      ],
    }).compileComponents();
  }, 30000);

  it('should render one row per passenger', async () => {
    const fixture = TestBed.createComponent(PasajeroList);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('tbody tr').length).toBe(1);
    expect(compiled.textContent).toContain('Ana Torres');
    expect(compiled.textContent).toContain('Frecuente');
  }, 15000);
});
