import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth';

let refreshInFlight: Observable<any> | null = null;

export class AuthInterceptor {
  // Mantiene compatibilidad si se importa como clase o función
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = localStorage.getItem('access_token');

  let authReq = req;
  if (token && !req.url.includes('/auth/login')) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/')) {
        refreshInFlight ??= auth.refresh().pipe(
          tap(() => {
            refreshInFlight = null;
          }),
          catchError((err) => {
            refreshInFlight = null;
            auth.logout();
            return throwError(() => err);
          })
        );

        return refreshInFlight!.pipe(
          switchMap(() => {
            const newToken = localStorage.getItem('access_token');
            const newReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` }
            });
            return next(newReq);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
