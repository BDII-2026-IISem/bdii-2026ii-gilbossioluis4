import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Pasajero } from '../../core/models/pasajero.model';
import { PasajeroApi } from './pasajero-api';

const PASAJERO: Pasajero = {
  id: 1,
  nombre: 'Ana Torres',
  descripcion: 'Frecuente',
  email: 'ana@movicab.test',
  status: 'active',
};

describe('PasajeroApi', () => {
  let api: PasajeroApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(PasajeroApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('reads passengers from the Django collection endpoint', () => {
    let resultado: Pasajero[] | undefined;
    api.list().subscribe((pasajeros) => (resultado = pasajeros));

    const request = http.expectOne(`${environment.apiUrl}/pasajeros/`);
    expect(request.request.method).toBe('GET');
    request.flush([PASAJERO]);
    expect(resultado).toEqual([PASAJERO]);
  });
});