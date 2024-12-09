import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('Token');

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          localStorage.removeItem('Token');
          this.router.navigate(['/main']);
          return throwError(() => new Error('არასოწრი ელ-ფოსტა ან პაროლი'));
        }
        
        if (error.status === 403) {
          return throwError(() => new Error('You do not have permission to access this resource'));
        }

        if (error.status === 404) {
          return throwError(() => new Error('The requested resource was not found'));
        }

        return throwError(() => new Error('An error occurred. Please try again later'));
      })
    );
  }
}