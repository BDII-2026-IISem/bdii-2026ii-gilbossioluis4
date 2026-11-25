import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, shareReplay, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth';
import { SessionStore } from '../services/session-store';
import { TokenPair } from '../models/auth.model';

let refreshInFlight: Observable<TokenPair> | null = null;

export class AuthInterceptor {
  // Mantiene compatibilidad si se importa como clase o función
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const session = inject(SessionStore);
  const router = inject(Router);
  const isAuthEndpoint = /\/auth\/(login|refresh|logout)\//.test(req.url);
  const token = session.accessToken();

  let authReq = req;
  if (token && !isAuthEndpoint) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthEndpoint) {
        refreshInFlight ??= auth.refresh().pipe(
          catchError((refreshError: unknown) => {
            session.clear();
            void router.navigate(['/login']);
            return throwError(() => refreshError);
          }),
          finalize(() => {
            refreshInFlight = null;
          }),
          shareReplay({ bufferSize: 1, refCount: false }),
        );

        return refreshInFlight.pipe(
          switchMap(() => {
            const newToken = session.accessToken();
            if (!newToken) {
              return throwError(() => error);
            }
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
