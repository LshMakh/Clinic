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
  providedIn: 'root',
})
export class AppointmentService {
  private patientAppointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  private doctorAppointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  private appointmentCountSubject = new BehaviorSubject<number>(0);
  appointmentCount$ = this.appointmentCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCurrentUserAppointmentCount(): Observable<number> {
    return this.http
      .get<any>(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.appointment.base}${API_CONFIG.endpoints.appointment.count}`
      )
      .pipe(
        tap((count) => {
          this.appointmentCountSubject.next(count);
        })
      );
  }

  getSelectedDoctorAppointmentCount(doctorId: number): Observable<number> {
    return this.http
      .get<any>(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.appointment.base}${API_CONFIG.endpoints.appointment.count}/${doctorId}`
      )
      .pipe(
        tap((count) => {
          this.appointmentCountSubject.next(count);
        })
      );
  }

  createAppointment(appointmentData: CreateAppointmentDto): Observable<any> {
    return this.http
      .post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.appointment.base}${API_CONFIG.endpoints.appointment.book}`,
        appointmentData
      )
      .pipe(
        tap(() => {
          this.loadPatientAppointments();
        }),
        catchError((error) => {
       
          return throwError(
            () => new Error('ამ დროისთვის, უკვე დაჯავშნილი გაქვთ ვიზიტი')
          );
        })
      );
  }

  blockTimeSlot(date: Date, timeSlot: string): Observable<any> {
    return this.http
      .post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.appointment.base}${API_CONFIG.endpoints.appointment.blockTime}`,
        { appointmentDate: date, timeSlot }
      )
      .pipe(
        tap(() => {
          this.loadDoctorAppointments();
        }),
        catchError(this.handleError)
      );
  }

  loadDoctorAppointments(): Observable<Appointment[]> {
    return this.http
      .get<Appointment[]>(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.appointment.base}${API_CONFIG.endpoints.appointment.loadDoc}`
      )
      .pipe(
        tap((appointments) =>
          this.doctorAppointmentsSubject.next(appointments)
        ),
        catchError(this.handleError)
      );
  }

  loadDoctorAppointmentsFromUser(id: number): Observable<Appointment[]> {
    return this.http
      .get<Appointment[]>(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.appointment.base}${API_CONFIG.endpoints.appointment.loadDoc}/${id}`
      )
      .pipe(
        tap((appointments) =>
          this.doctorAppointmentsSubject.next(appointments)
        ),
        catchError(this.handleError)
      );
  }

  loadPatientAppointments(): Observable<Appointment[]> {
    return this.http
      .get<Appointment[]>(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.appointment.base}${API_CONFIG.endpoints.appointment.loadPat}`
      )
      .pipe(
        tap((appointments) =>
          this.patientAppointmentsSubject.next(appointments)
        ),
        catchError(this.handleError)
      );
  }

  updateAppointmentDescription(
    appointmentId: number,
    description: string
  ): Observable<any> {
    return this.http
      .put(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.appointment.base}/${appointmentId}${API_CONFIG.endpoints.appointment.update}`,
        { description }
      )
      .pipe(
        tap(() => {
          this.loadPatientAppointments();
          this.loadDoctorAppointments();
        }),
        catchError(this.handleError)
      );
  }

  deleteAppointment(appointmentId: number): Observable<any> {
    return this.http
      .delete(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.appointment.base}${API_CONFIG.endpoints.appointment.delete}/${appointmentId}`
      )
      .pipe(
        tap(() => {
          const currentCount = this.appointmentCountSubject.value;
          this.appointmentCountSubject.next(currentCount - 1);

          this.loadPatientAppointments();
          this.loadDoctorAppointments();
        }),
        catchError(this.handleError)
      );
  }

  getAvailableSlots(doctorId: number, date: Date): Observable<TimeSlot[]> {
    const formattedDate = this.formatDate(date);
    return this.http
      .get<TimeSlot[]>(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.appointment.base}${API_CONFIG.endpoints.appointment.available}${doctorId}?date=${formattedDate}`
      )
      .pipe(catchError(this.handleError));
  }

  checkSlotAvailability(
    doctorId: number,
    date: Date,
    timeSlot: string
  ): Observable<boolean> {
    const formattedDate = this.formatDate(date);
    return this.http
      .get<{ isAvailable: boolean }>(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.appointment.base}${API_CONFIG.endpoints.appointment.slotAvailable}${doctorId}?date=${formattedDate}&timeSlot=${timeSlot}`
      )
      .pipe(
        map((response) => response.isAvailable),
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
      errorMessage = error.error.message;
    } else {
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
