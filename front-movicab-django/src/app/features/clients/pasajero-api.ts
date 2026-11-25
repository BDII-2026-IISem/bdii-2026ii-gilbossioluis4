import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Status } from '../../core/models/api.model';
import { Pasajero, PasajeroPayload } from '../../core/models/pasajero.model';

@Injectable({ providedIn: 'root' })
export class PasajeroApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/pasajeros`;

  list(): Observable<Pasajero[]> {
    return this.http.get<Pasajero[]>(`${this.base}/`);
  }

  create(payload: PasajeroPayload & { status: Status }): Observable<Pasajero> {
    return this.http.post<Pasajero>(`${this.base}/`, payload);
  }

  update(id: number, payload: Partial<PasajeroPayload>): Observable<Pasajero> {
    return this.http.patch<Pasajero>(`${this.base}/${id}/`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/`);
  }
}