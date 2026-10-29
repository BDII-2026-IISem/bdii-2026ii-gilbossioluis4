import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { Client } from '../../../core/models/client.model';
import { ClientApi } from '../client-api';
import { NotificationService } from '../../../core/services/notification';
import { ClientList } from './client-list';

const CLIENTE: Client = {
  id: 1,
  name: 'Ana Torres',
  address: 'Calle 10 # 20-30',
  phone: '3001234567',
  email: 'ana@movicab.test',
  status: 'active',
};

describe('ClientList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientList],
      providers: [
        ConfirmationService,
        MessageService,
        provideNoopAnimations(),
        providePrimeNG({ theme: { preset: Aura } }),
        {
          provide: ClientApi,
          useValue: { list: () => of([CLIENTE]) },
        },
        {
          provide: NotificationService,
          useValue: { success() {}, warn() {}, error() {} },
        },
      ],
    }).compileComponents();
  }, 30000);

  it('should render one row per client', async () => {
    const fixture = TestBed.createComponent(ClientList);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('tbody tr').length).toBe(1);
    expect(compiled.textContent).toContain('Ana Torres');
  }, 15000);
});
