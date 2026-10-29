import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SaleLine } from '../../core/models/sale.model';
import { SaleApi } from '../sales/sale-api';

@Injectable({ providedIn: 'root' })
export class ProductSaleApi {
  private readonly saleApi = inject(SaleApi);

  list(): Observable<SaleLine[]> {
    return this.saleApi
      .list()
      .pipe(map((sales) => sales.flatMap((v) => v.lines ?? [])));
  }

  getBySale(saleId: number): Observable<SaleLine[]> {
    return this.saleApi
      .get(saleId)
      .pipe(map((sale) => sale.lines ?? []));
  }
}
