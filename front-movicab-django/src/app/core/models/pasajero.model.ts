import { Status, Timestamps } from './api.model';

export interface Pasajero extends Timestamps {
  id: number;
  nombre: string;
  descripcion: string | null;
  email: string | null;
  status: Status;
}

export interface PasajeroPayload {
  nombre: string;
  descripcion: string | null;
  email: string | null;
}