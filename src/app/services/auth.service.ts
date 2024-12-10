import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { PasswordChangeDto, UserLoginDto } from '../Models/Login.model';
import { User } from '../Models/Patient.model';
import { API_CONFIG } from '../config/api.config';

interface EmailCheckResponse {
  exists: boolean;
}

interface EmailVerificationRequest {
  email: string;
  verificationCode?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.initializeFromToken();
  }

  private initializeFromToken() {
    const token = localStorage.getItem('Token');
    if (token) {
      this.isAuthenticatedSubject.next(true);
      const decodedToken = this.getDecodedToken();
      if (decodedToken?.nameid) {
        this.fetchUserDetails(decodedToken.nameid).subscribe({
          next: (user) => this.currentUserSubject.next(user),
          error: () => this.logout(),
        });
      }
    }
  }

  authenticate(loginData: UserLoginDto): Observable<any> {
    return this.http
      .post<any>(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.user.base}${API_CONFIG.endpoints.user.authenticate}`,
        loginData
      )
      .pipe(
        tap((response) => {
          if (response?.accessToken) {
            localStorage.setItem('Token', response.accessToken);
            this.isAuthenticatedSubject.next(true);
            this.initializeFromToken();
          }
        })
      );
  }

  requestPasswordReset(email: string): Observable<any> {
    const body = { email: email };
    return this.http.post(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.user.base}${API_CONFIG.endpoints.user.forgotPassword}`,
      body
    );
  }

  changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Observable<any> {
    const payload: PasswordChangeDto = {
      currentPassword,
      newPassword,
      confirmPassword,
    };

    return this.http.put(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.user.base}${API_CONFIG.endpoints.user.changePassword}`,
      payload
    );
  }

  sendVerificationCode(email: string): Observable<any> {
    return this.http
      .post(`${API_CONFIG.baseUrl}/Verification/send`, { email })
      .pipe(catchError(this.handleError));
  }

  verifyCode(email: string, verificationCode: string): Observable<any> {
    return this.http
      .post(`${API_CONFIG.baseUrl}/Verification/verify`, {
        email,
        verificationCode,
      })
      .pipe(catchError(this.handleError));
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http
      .get<EmailCheckResponse>(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.user.base}${API_CONFIG.endpoints.user.checkEmail}/${email}`
      )
      .pipe(
        map((response) => response.exists),
        catchError(() => {
          return throwError(
            () => new Error('Unable to verify email. Please try again.')
          );
        })
      );
  }

  addUser(user: User): Observable<any> {
    return this.http
      .post<any>(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.patient.base}${API_CONFIG.endpoints.patient.register}`,
        user
      )
      .pipe(catchError(this.handleError));
  }

  addDoctor(formData: FormData): Observable<any> {
    return this.http
      .post<any>(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.doctor.base}${API_CONFIG.endpoints.doctor.register}`,
        formData
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 409) {
            return throwError(
              () => new Error('This doctor is already registered')
            );
          }
          if (error.status === 413) {
            return throwError(
              () => new Error('The uploaded files are too large')
            );
          }
          return throwError(
            () =>
              new Error('Doctor registration failed. Please try again later.')
          );
        })
      );
  }

  private fetchUserDetails(userId: string): Observable<any> {
    return this.http
      .get<any>(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.user.base}${API_CONFIG.endpoints.user.info}/${userId}`
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred. Please try again later.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Invalid request';
          break;
        case 401:
          errorMessage = 'Unauthorized: Please login again';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 409:
          errorMessage = 'This email is already registered';
          break;
        case 422:
          errorMessage = 'Invalid verification code';
          break;
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  logout(): void {
    localStorage.removeItem('Token');
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/main']);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  getCurrentUser(): Observable<any> {
    return this.currentUserSubject.asObservable();
  }

  private getDecodedToken(): any {
    const token = localStorage.getItem('Token');
    return token ? jwtDecode(token) : null;
  }

  getUserId(): string | null {
    const decodedToken = this.getDecodedToken();
    return decodedToken?.nameid || null;
  }

  getUserPatientId(): string | null {
    const decodedToken = this.getDecodedToken();
    return decodedToken?.PatientId || null;
  }

  getUserDoctorId(): string | null {
    const decodedToken = this.getDecodedToken();
    return decodedToken?.DoctorId || null;
  }

  getRole(): string | null {
    const decodedToken = this.getDecodedToken();
    return decodedToken?.role || null;
  }

  isPatient(): boolean {
    return this.getRole() === 'Patient';
  }

  isDoctor(): boolean {
    return this.getRole() === 'Doctor';
  }

  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }
}
