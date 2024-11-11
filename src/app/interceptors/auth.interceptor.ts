import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly AUTH_HEADER = 'Authorization';
  private readonly TOKEN_PREFIX = 'Bearer ';

  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get token from localStorage
    const token = localStorage.getItem('Token');

    // Clone and modify the request
    let modifiedRequest = request;

    if (token && !this.isPublicEndpoint(request.url)) {
      modifiedRequest = request.clone({
        headers: request.headers
          .set(this.AUTH_HEADER, `${this.TOKEN_PREFIX}${token}`)
          .set('Content-Type', 'application/json')
      });
    }

    // Process the request and handle responses/errors
    return next.handle(modifiedRequest).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          // Log successful responses if needed
          this.logResponse(event, modifiedRequest);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // Handle different types of errors
        return this.handleError(error);
      })
    );
  }

  private isPublicEndpoint(url: string): boolean {
    const publicEndpoints = [
      '/api/User/Authenticate',
      '/api/Patient/RegisterPatient',
      '/api/Doctor/GetDoctorCards'
    ];
    return publicEndpoints.some(endpoint => url.includes(endpoint));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('Token');
      this.router.navigate(['/main']);
      return throwError(() => new Error('Unauthorized access. Please log in again.'));
    }

    if (error.status === 403) {
      // Handle forbidden access
      this.router.navigate(['/main']);
      return throwError(() => new Error('Access forbidden. You do not have permission to access this resource.'));
    }

    if (error.status === 404) {
      // Handle not found errors
      return throwError(() => new Error('The requested resource was not found.'));
    }

    if (error.status === 0) {
      // Handle connection errors
      return throwError(() => new Error('A connection error occurred. Please check your internet connection.'));
    }

    // Handle other errors
    const errorMessage = error.error?.message || 'An unexpected error occurred.';
    return throwError(() => new Error(errorMessage));
  }

  private logResponse(response: HttpResponse<any>, request: HttpRequest<unknown>): void {
    // Only log in development environment
    if (!this.isProduction()) {
      const logMessage = `[HTTP] ${request.method} ${request.url} ${response.status}`;
      console.log(logMessage);
    }
  }

  private isProduction(): boolean {
    // TODO: Replace with actual environment check
    return false;
  }
}