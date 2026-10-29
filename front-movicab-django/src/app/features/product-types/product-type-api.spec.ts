import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProductType } from '../../core/models/product-type.model';
import { ProductTypeApi } from './product-type-api';

const TIPO: ProductType = {
  id: 1,
  name: 'Ejecutivo',
  description: 'Servicios VIP',
  status: 'active',
};

describe('ProductTypeApi', () => {
  let api: ProductTypeApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ProductTypeApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should call /api/product-types/?status=active with trailing slash and status param', () => {
    let resultado: ProductType[] | undefined;
    api.list('active').subscribe((res) => (resultado = res));

    const peticion = http.expectOne('http://localhost:8000/api/product-types/?status=active');
    expect(peticion.request.method).toBe('GET');
    peticion.flush([TIPO]);

    expect(resultado).toEqual([TIPO]);
  });
});
