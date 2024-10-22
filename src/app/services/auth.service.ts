import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Login } from '../Models/Login.model';
import { User } from '../Models/Patient.model';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { BehaviorSubject, catchError, Observable, ObservableNotification, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<any>(null);

  constructor(private http:HttpClient, private router:Router) { 
    const token = localStorage.getItem('Token');
    if(token){
      this.isAuthenticatedSubject.next(true);
      this.setCurrentUserFromToken();
    }
  }


  private baseUrl = 'https://localhost:7226/api/Patient';


  authenticate(login: Login): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
    };

    // Log the request payload
    console.log('Sending authentication request:', login);

    return this.http.post<any>(`${this.baseUrl}/Authenticate`, login, httpOptions)
      .pipe(
        tap(response => {
          console.log('Auth response:', response);
          if (response && response.accessToken) {
            localStorage.setItem('Token', response.accessToken);
            this.isAuthenticatedSubject.next(true);
            this.setCurrentUserFromToken();
            this.router.navigate(['/main']);
          }
        }),
        catchError(this.handleError)
      );
  }
  
  logout():void{
    localStorage.removeItem('Token');
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/main']);
  }

  isAuthenticated():Observable<boolean>{
    return this.isAuthenticatedSubject.asObservable();
  }
  getCurrentUser():Observable<any>{
    return this.currentUserSubject.asObservable();
  }

  private  setCurrentUserFromToken(){
    const token = localStorage.getItem('Token');
    if(token){
      this.currentUserSubject.next({
        firstName:this.getUserFirstName(),
        lastName:this.getUserLastName(),
        personalNumber:this.getPersonalNumber(),
        email:this.getUserEmail(),
        role:this.getRole()
      });
    }
  }


  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    let errorMessage = 'Authentication failed';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Backend error
      errorMessage = error.error?.message || `Server returned code ${error.status}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }


  getByEmail(email:string):Observable<any>{
    return this.http.get<User>(`https://localhost:44332/api/Users/get_user_name/${email}`);
  }



  addUser(user:User):Observable<any>{
    let httpOptions = {
      headers: new HttpHeaders({'Content-Type':'application/json'})
    }
    return this.http.post<any>("https://localhost:7226/api/Patient/RegisterUser",user,httpOptions);
  }

  getDecodedToken(): any {
    const token = localStorage.getItem('Token');
    if (token) {
      return jwtDecode(token);
    }
    return null;
  }

  getUserId(): string | null {
    const decodedToken = this.getDecodedToken();
    return decodedToken.Id;
  }

  getUserEmail():string|null{
    const decodedToken = this.getDecodedToken();
    return decodedToken.Email;
  }

  getUserFirstName(): string | null {
    const decodedToken = this.getDecodedToken();
    return decodedToken.FirstName;
  }

  getUserLastName():string|null{
    const decodedToken = this.getDecodedToken();
    return decodedToken.LastName;
  }

  getPersonalNumber():string|null{
    const decodedToken = this.getDecodedToken();
    return decodedToken.PersonalNumber;
  }

  getRole():string|null{
    const decodedToken = this.getDecodedToken();
    return decodedToken.role;
  }

  isPatient():boolean{
    return this.getRole() ==='Patient';
  }

  isDoctor():boolean{
    return this.getRole() === 'Doctor';
  }

  isAdmin():boolean{
    return this.getRole() === 'Admin';
  }

}