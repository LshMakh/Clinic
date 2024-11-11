import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, switchMap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { UserLoginDto } from '../Models/Login.model';
import { User } from '../Models/Patient.model';
import { API_CONFIG } from '../config/api.config';

interface EmailCheckResponse {
  exists: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<any>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeFromToken();
  }

  private initializeFromToken() {
    const token = localStorage.getItem('Token');
    if (token) {
      this.isAuthenticatedSubject.next(true);
      const decodedToken = this.getDecodedToken();
      if (decodedToken?.nameid) {
        this.currentUserSubject.next({
          userId: decodedToken.nameid,
          role: decodedToken.role
        });

        this.fetchUserDetails(decodedToken.nameid).subscribe({
          next: (user) => this.currentUserSubject.next(user),
          error: () => this.handleAuthError()
        });
      }
    }
  }

  authenticate(loginData: UserLoginDto): Observable<any> {
    return this.http.post<any>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.user.base}${API_CONFIG.endpoints.user.authenticate}`,
      loginData
    ).pipe(
      tap(response => {
        if (response?.accessToken) {
          localStorage.setItem('Token', response.accessToken);
          this.isAuthenticatedSubject.next(true);
          this.initializeFromToken();
        }
      })
    );
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<EmailCheckResponse>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.user.base}${API_CONFIG.endpoints.user.checkEmail}/${email}`
    ).pipe(
      map(response => response.exists) // Use map to extract the exists property
    );
  }

  addUser(user: User): Observable<any> {
    return this.http.post<any>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.patient.base}${API_CONFIG.endpoints.patient.register}`,
      user
    );
  }

  addDoctor(doctor: any): Observable<any> {
    return this.http.post<any>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.doctor.base}${API_CONFIG.endpoints.doctor.register}`,
      doctor
    );
  }

  private fetchUserDetails(userId: string): Observable<any> {
    return this.http.get<any>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.user.base}${API_CONFIG.endpoints.user.info}/${userId}`
    );
  }

  logout(): void {
    localStorage.removeItem('Token');
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/main']);
  }

  // Utility methods
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

  getRole(): string | null {
    const decodedToken = this.getDecodedToken();
    return decodedToken?.role || null;
  }

  // Role checking methods
  isPatient(): boolean {
    return this.getRole() === 'Patient';
  }

  isDoctor(): boolean {
    return this.getRole() === 'Doctor';
  }

  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }

  private handleAuthError(): void {
    this.logout();
  }
}