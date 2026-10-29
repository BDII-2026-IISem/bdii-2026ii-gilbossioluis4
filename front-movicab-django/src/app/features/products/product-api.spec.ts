import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Product } from '../../core/models/product.model';
import { ProductApi } from './product-api';

const PRODUCTO: Product = {
  id: 1,
  productTypeId: 1,
  productTypeName: 'Ejecutivo',
  name: 'Carrera Urbana',
  brand: 'MoviCab',
  price: '12.50',
  minStock: 5,
  quantity: 10,
  status: 'active',
};

describe('ProductApi', () => {
  let api: ProductApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ProductApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should call /api/products/available/ with trailing slash', () => {
    let resultado: Product[] | undefined;
    api.available().subscribe((res) => (resultado = res));

    const peticion = http.expectOne('http://localhost:8000/api/products/available/');
    expect(peticion.request.method).toBe('GET');
    peticion.flush([PRODUCTO]);

    expect(resultado).toEqual([PRODUCTO]);
  });
});
