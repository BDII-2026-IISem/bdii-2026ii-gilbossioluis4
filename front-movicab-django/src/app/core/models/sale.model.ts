import { Money, Status, Timestamps } from './api.model';

export interface SaleLine {
  id: number;
  product: number;
  productName?: string;
  quantity: number;
  unitPrice: Money;
  lineTotal: Money;
}

export interface Sale extends Timestamps {
  id: number;
  client: number;
  clientName?: string;
  saleDate: string;
  subtotal: Money;
  tax: Money;
  discounts: Money;
  total: Money;
  status: Status;
  lines?: SaleLine[];
}

export interface SaleItemPayload {
  productId: number;
  quantity: number;
}

export interface SaleCreatePayload {
  clientId: number;
  saleDate: string;
  discounts: Money;
  items: SaleItemPayload[];
}
