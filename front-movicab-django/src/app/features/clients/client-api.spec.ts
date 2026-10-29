import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Client } from '../../core/models/client.model';
import { ClientApi } from './client-api';

const CLIENTE: Client = {
  id: 1,
  name: 'Ana Torres',
  address: 'Calle 10 # 20-30',
  phone: '3001234567',
  email: 'ana@movicab.test',
  status: 'active',
};

describe('ClientApi', () => {
  let api: ClientApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ClientApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should read the flat array from http://localhost:8000/api/clients/', () => {
    expect(environment.apiUrl.endsWith('/api')).toBe(true);
    let resultado: Client[] | undefined;
    api.list().subscribe((clients) => (resultado = clients));
    const peticion = http.expectOne('http://localhost:8000/api/clients/');
    expect(peticion.request.method).toBe('GET');
    peticion.flush([CLIENTE]);
    expect(resultado).toEqual([CLIENTE]);
  });
});