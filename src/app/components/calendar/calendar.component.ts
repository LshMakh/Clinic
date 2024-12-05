import { Component, OnInit, OnDestroy, Input, input } from '@angular/core';
import { AppointmentService, TimeSlot, Appointment } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl:'./calendar.component.css',
})
export class CalendarComponent implements OnInit, OnDestroy {
  @Input() doctorId!: number;
  @Input() viewMode: 'doctor' | 'patient'|'booking' = 'patient';
  @Input() isDeleteVisible:boolean = false;
  @Input() isEditVisible:boolean = false;

  currentYear: number = new Date().getFullYear();
  currentMonthName: string = '';
  currentDate: Date = new Date();
  displayedWeek: Date[] = [];
  showBookingModal = false;
  selectedDate: Date | null = null;
  selectedTimeSlot: string | null = null;
  userRole : any;

  daysOfWeek: string[] = ['კვი', 'ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ'];
  timeSlots: string[] = [
    '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
    '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00',
    '15:00 - 16:00', '16:00 - 17:00'
  ];

  private appointments: Map<string, Appointment> = new Map();
  private availableSlots: Map<string, TimeSlot> = new Map();
  private destroy$ = new Subject<void>();
  private userId: string | null = null;
  private userPatientId:string|null = null;
  private userDoctorId:string|null = null;

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userId = this.authService.getUserId();
    this.userDoctorId = this.authService.getUserDoctorId();
    this.userPatientId = this.authService.getUserPatientId();
    this.updateWeek();
    this.loadInitialData();
    this.subscribeToAppointments();
    this.userRole = this.authService.getRole();

    console.log(this.authService.getUserPatientId());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadInitialData() {
    if (this.viewMode ==='booking'){
      await firstValueFrom(this.appointmentService.loadDoctorAppointmentsFromUser(this.doctorId))

    }
    
    if(this.authService.getRole()==='ADMIN'){
      await firstValueFrom(this.appointmentService.loadDoctorAppointmentsFromUser(this.doctorId))
    }

    else if (this.viewMode === 'doctor' && this.authService.getRole() !=='ADMIN') {
      
      await firstValueFrom(this.appointmentService.loadDoctorAppointments());

    } else {
      await firstValueFrom(this.appointmentService.loadPatientAppointments());
    }
    await this.loadAvailableSlots();
  }

  private subscribeToAppointments() {
    const appointmentsObservable = this.viewMode === 'booking'
      ? this.appointmentService.getDoctorAppointments()
      : this.viewMode === 'doctor'
        ? this.appointmentService.getDoctorAppointments()
        : this.appointmentService.getPatientAppointments();

    appointmentsObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe(appointments => {
        this.updateAppointmentsMap(appointments);
      });
  }

  private async loadAvailableSlots() {
    if (this.doctorId) {
      try {
        const slots = await firstValueFrom(this.appointmentService.getAvailableSlots(this.doctorId, this.currentDate)
      );
      this.updateAvailableSlotsMap(slots);
    } catch (error) {
      console.error('Error loading available slots:', error);
    }
  }
}

getSlotStatus(day: Date, timeSlot: string): 'available' | 'own' | 'booked' | 'weekend' {
  if (this.isWeekend(day)) {
    return 'weekend';
  }

  const key = this.getSlotKey(day, timeSlot);
  const appointment = this.appointments.get(key);
  const slot = this.availableSlots.get(key);

  if(this.authService.getRole()==='PATIENT' || this.authService.getRole() ==="ADMIN"){
    if (appointment) {
      if(this.authService.getRole()==='ADMIN' && this.viewMode==='doctor') {
        return 'own'; 
      }
      return appointment.patientId.toString() === this.userPatientId ? 'own' : 'booked';
    }
  }
  else if(this.authService.getRole()==='DOCTOR'){
    if(appointment){
      return appointment.doctorId.toString() === this.userDoctorId ? 'own':'booked';
    }
  }
  if (slot && !slot.isAvailable) {
    return 'booked';
  }

  return 'available';
}

private getSlotKey(date: Date, timeSlot: string): string {
  return `${date.toISOString().split('T')[0]}_${timeSlot}`;
}

private updateAppointmentsMap(appointments: Appointment[]) {
  this.appointments.clear();
  appointments.forEach(appointment => {
    const key = this.getSlotKey(new Date(appointment.appointmentDate), appointment.timeSlot);
    this.appointments.set(key, appointment);
  });
}

private updateAvailableSlotsMap(slots: TimeSlot[]) {
  this.availableSlots.clear();
  slots.forEach(slot => {
    const key = this.getSlotKey(this.currentDate, slot.timeSlot);
    this.availableSlots.set(key, slot);
  });
}

async makeReservation(date: Date, timeSlot: string) {
  if (!this.userId) {
    alert('Please log in to book appointments');
    return;
  }

  if (date.getTime() < Date.now()) {
    alert('Cannot book appointments in the past');
    return;
  }

  try {
    const isAvailable = await firstValueFrom(
      this.appointmentService.checkSlotAvailability(this.doctorId, date, timeSlot)
    );

    if (!isAvailable) {
      alert('This time slot is no longer available');
      return;
    }

    // Set these before showing modal
    this.selectedDate = date;
    this.selectedTimeSlot = timeSlot;
    this.showBookingModal = true;
    
    // Force change detection if needed
    // this.cdr.detectChanges();
  } catch (error) {
    console.error('Error checking slot availability:', error);
    alert('Error checking slot availability');
  }
}
async deleteReservation(event: Event, date: Date, timeSlot: string) {
  event.stopPropagation();
  
  if (!confirm('Are you sure you want to cancel this appointment?')) {
    return;
  }

  const key = this.getSlotKey(date, timeSlot);
  const appointment = this.appointments.get(key);
  
  if (appointment) {
    try {
      await firstValueFrom(
        this.appointmentService.deleteAppointment(appointment.appointmentId)
      );
      await this.loadInitialData();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to delete appointment');
    }
  }
}

previousWeek() {
  this.currentDate = new Date(this.currentDate.setDate(this.currentDate.getDate() - 7));
  this.updateWeek();
  this.loadAvailableSlots();
}

nextWeek() {
  this.currentDate = new Date(this.currentDate.setDate(this.currentDate.getDate() + 7));
  this.updateWeek();
  this.loadAvailableSlots();
}

isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6;
}

isFirstWeekOfMonth(): boolean {
  const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
  return this.currentDate <= firstDay;
}

private updateWeek() {
  const startOfWeek = this.getMonday(this.currentDate);
  this.displayedWeek = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    this.displayedWeek.push(date);
  }

  this.currentYear = this.currentDate.getFullYear();
  this.currentMonthName = this.currentDate.toLocaleString('default', { month: 'long' });
}

private getMonday(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

closeBookingModal() {
  this.showBookingModal = false;
  this.selectedDate = null;
  this.selectedTimeSlot = null;
}

async onAppointmentBooked() {
  await this.loadInitialData();
  this.closeBookingModal();
}
}