import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type DomainRecord = Record<string, unknown> & { id: number };

@Injectable({ providedIn: 'root' })
export class DomainApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  list<T extends DomainRecord>(resource: string): Observable<T[]> {
    return this.http.get<T[]>(this.collectionUrl(resource));
  }

  create<T extends DomainRecord>(resource: string, payload: Record<string, unknown>): Observable<T> {
    return this.http.post<T>(this.collectionUrl(resource), payload);
  }

  update<T extends DomainRecord>(resource: string, id: number, payload: Record<string, unknown>): Observable<T> {
    return this.http.patch<T>(`${this.base}/${resource}/${id}/`, payload);
  }

  updateCareerStatus<T extends DomainRecord>(id: number, estado: string): Observable<T> {
    return this.http.patch<T>(`${this.base}/carreras/${id}/estado/`, { estado });
  }

  remove(resource: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${resource}/${id}/`);
  }

  private collectionUrl(resource: string): string {
    const [path, query] = resource.split('?');
    return `${this.base}/${path}/${query ? `?${query}` : ''}`;
  }
}