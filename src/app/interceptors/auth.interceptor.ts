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
    // Get token from localStorage
    const token = localStorage.getItem('Token');

    if (token) {
      // Clone the request and add auth header
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Handle the request and catch any errors
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Unauthorized - clear token and redirect to main page
          localStorage.removeItem('Token');
          this.router.navigate(['/main']);
          return throwError(() => new Error('Unauthorized: Incorrect username or password'));
        }
        
        if (error.status === 403) {
          return throwError(() => new Error('You do not have permission to access this resource'));
        }

        if (error.status === 404) {
          return throwError(() => new Error('The requested resource was not found'));
        }

        // Default error message
        return throwError(() => new Error('An error occurred. Please try again later'));
      })
    );
  }
}