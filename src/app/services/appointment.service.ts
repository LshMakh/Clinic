import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';

export interface Appointment {
  appointmentId: number;
  doctorId: number;
  patientId: number;
  appointmentDate: Date;
  timeSlot: string;
  description?: string;
  isBlocked: boolean;
  doctorFirstName?: string;
  doctorLastName?: string;
  doctorSpecialty?: string;
  patientFirstName?: string;
  patientLastName?: string;
}

export interface TimeSlot {
  timeSlot: string;
  isAvailable: boolean;
  isBlocked: boolean;
  patientId?: number;
}

export interface CreateAppointmentDto {
  doctorId: number;
  appointmentDate: Date;
  timeSlot: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `${API_CONFIG.baseUrl}/appointment`;
  private patientAppointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  private doctorAppointmentsSubject = new BehaviorSubject<Appointment[]>([]);

  constructor(private http: HttpClient) {}
  
  getCurrentUserAppointmentCount(): Observable<number> {
    return this.http.get<any>(`https://localhost:7226/api/Appointment/count`);
  }
  getSelectedDoctorAppointmentCount(doctorId:number):Observable<number>{
    return this.http.get<any>(`https://localhost:7226/api/Appointment/count/${doctorId}`);
  }
  
  createAppointment(appointmentData: CreateAppointmentDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/book`, appointmentData).pipe(
      tap(() => {
        this.loadPatientAppointments();
      }),
      catchError(this.handleError)
    );
  }

  blockTimeSlot(date: Date, timeSlot: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/block`, { appointmentDate: date, timeSlot }).pipe(
      tap(() => {
        this.loadDoctorAppointments();
      }),
      catchError(this.handleError)
    );
  }

  loadDoctorAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/doctor`).pipe(
      tap(appointments => this.doctorAppointmentsSubject.next(appointments)),
      catchError(this.handleError)
    );
  }

   // Get appointments for doctor (non-logged in)
   loadDoctorAppointmentsFromUser(id:number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/doctor/${id}`).pipe(
      tap(appointments => this.doctorAppointmentsSubject.next(appointments)),
      catchError(this.handleError)
    );
  }

  loadPatientAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/patient`).pipe(
      tap(appointments => this.patientAppointmentsSubject.next(appointments)),
      catchError(this.handleError)
    );
  }

  updateAppointmentDescription(appointmentId: number, description: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${appointmentId}/description`, { description }).pipe(
      tap(() => {
       
        this.loadPatientAppointments();
        this.loadDoctorAppointments();
      }),
      catchError(this.handleError)
    );
  }
  

  deleteAppointment(appointmentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${appointmentId}`).pipe(
      tap(() => {
        this.loadPatientAppointments();
        this.loadDoctorAppointments();
        this.getCurrentUserAppointmentCount();
      }),
      catchError(this.handleError)
    );
  }

  getAvailableSlots(doctorId: number, date: Date): Observable<TimeSlot[]> {
    const formattedDate = this.formatDate(date);
    return this.http.get<TimeSlot[]>(
      `${this.apiUrl}/available-slots/${doctorId}?date=${formattedDate}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  checkSlotAvailability(doctorId: number, date: Date, timeSlot: string): Observable<boolean> {
    const formattedDate = this.formatDate(date);
    return this.http.get<{isAvailable: boolean}>(
      `${this.apiUrl}/check-availability/${doctorId}?date=${formattedDate}&timeSlot=${timeSlot}`
    ).pipe(
      map(response => response.isAvailable),
      catchError(this.handleError)
    );
  }

  getDoctorAppointments(): Observable<Appointment[]> {
    return this.doctorAppointmentsSubject.asObservable();
  }

  getPatientAppointments(): Observable<Appointment[]> {
    return this.patientAppointmentsSubject.asObservable();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Invalid appointment data';
          break;
        case 401:
          errorMessage = 'You must be logged in to manage appointments';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action';
          break;
        case 404:
          errorMessage = 'Appointment not found';
          break;
        case 409:
          errorMessage = 'This time slot is already booked';
          break;
        case 422:
          errorMessage = 'Cannot book appointment in the past';
          break;
        case 503:
          errorMessage = 'Service temporarily unavailable';
          break;
        default:
          errorMessage = 'An error occurred while processing your request';
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}