import { Money, Status, Timestamps } from './api.model';

export interface ProductSale extends Timestamps {
  id: number;
  saleId: number;
  productId: number;
  quantity: number;
  unitPrice: Money;
  lineTotal: Money;
  status: Status;
}

export type SaleItemLine = Pick<
  ProductSale,
  'productId' | 'quantity' | 'unitPrice' | 'lineTotal'
>;

export interface SaleItemInput {
  productId: number;
  quantity: number;
}