import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Appointment {
  id: number;
  doctorId: number;
  userId: number;
  date: Date;
  timeSlot: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointments: Appointment[] = [
    { id: 1, doctorId: 1, userId: 2, date: new Date(2024, 9, 20), timeSlot: '10:00 - 11:00', description: 'Regular checkup' },
    { id: 2, doctorId: 1, userId: 3, date: new Date(2024, 9, 21), timeSlot: '14:00 - 15:00', description: 'Follow-up appointment' },
    { id: 3, doctorId: 1, userId: 4, date: new Date(2024, 9, 22), timeSlot: '11:00 - 12:00', description: 'Initial consultation' },
  ];

  private appointmentsSubject = new BehaviorSubject<Appointment[]>(this.appointments);

  constructor() {}

  getAppointments(): Observable<Appointment[]> {
    return this.appointmentsSubject.asObservable();
  }

  addAppointment(appointment: Appointment): void {
    this.appointments.push(appointment);
    this.appointmentsSubject.next(this.appointments);
  }

  getDoctorAppointments(doctorId: number): Observable<Appointment[]> {
    return new Observable<Appointment[]>(observer => {
      observer.next(this.appointments.filter(app => app.doctorId === doctorId));
    });
  }

  getUserAppointments(userId: number): Observable<Appointment[]> {
    return new Observable<Appointment[]>(observer => {
      observer.next(this.appointments.filter(app => app.userId === userId));
    });
  }

  isTimeSlotAvailable(doctorId: number, date: Date, timeSlot: string): boolean {
    return !this.appointments.some(
      app => app.doctorId === doctorId && 
             app.date.toDateString() === date.toDateString() && 
             app.timeSlot === timeSlot
    );
  }
}