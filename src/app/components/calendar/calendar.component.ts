import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AppointmentService, TimeSlot, Appointment } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-calendar',
  template: `
    <div class="weekly-calendar-container">
      <div class="calendar-header">
        <span>{{ currentYear }} {{ currentMonthName }}</span>
      </div>

      <div class="calendar-grid">
        <div class="time-slot-header">
          <button (click)="previousWeek()" class="arrow" [disabled]="isFirstWeekOfMonth()">&#10094;</button>
          <button (click)="nextWeek()" class="arrow">&#10095;</button>
        </div>

        <div *ngFor="let day of displayedWeek" class="day-header">
          {{ daysOfWeek[day.getDay()] }} {{ day | date:'d' }}
        </div>

        <ng-container *ngFor="let timeSlot of timeSlots">
          <div class="time-slot">{{ timeSlot }}</div>
          <div *ngFor="let day of displayedWeek" class="calendar-cell">
            <ng-container [ngSwitch]="getSlotStatus(day, timeSlot)">
              <!-- Available Slot -->
              <div *ngSwitchCase="'available'" 
                   class="activity empty" 
                   (click)="makeReservation(day, timeSlot)">
                <span>+&nbsp;</span> დაჯავშნა
              </div>

              <!-- User's Own Appointment -->
              <div *ngSwitchCase="'own'" class="activity reservation">
                <div>ჩემი ჯავშანი</div>
                <div (click)="deleteReservation($event, day, timeSlot)" class="white-circle">
                  <img src="/assets/images/close.svg" alt="delete">
                </div>
              </div>

              <!-- Booked by Someone Else or Blocked -->
              <div *ngSwitchCase="'booked'" class="activity off"></div>
              
              <!-- Weekend -->
              <div *ngSwitchCase="'weekend'" class="activity off yellow"></div>
            </ng-container>
          </div>
        </ng-container>
      </div>
    </div>

    <app-booking-modal 
      *ngIf="showBookingModal"
      [doctorId]="doctorId"
      [appointmentDate]="selectedDate!"
      [timeSlot]="selectedTimeSlot!"
      (close)="closeBookingModal()"
      (booked)="onAppointmentBooked()">
    </app-booking-modal>
  `,
  styles: [`
    .weekly-calendar-container {
      width: 100%;
      max-width: 1000px;
      margin: 0 auto;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: 150px repeat(7, 1fr);
      border-radius: 10px;
      overflow: hidden;
    }

    .time-slot-header,
    .day-header {
      background-color: #ecf2f8;
      padding: 10px;
      text-align: center;
    }

    .time-slot {
      background-color: white;
      padding: 10px;
      text-align: right;
      border-bottom: 1px solid #ecf2f8;
      border-right: 1px solid #ecf2f8dd;
      border-left: 1px solid #ecf2f8dd;
      color: #053354;
    }

    .calendar-cell {
      background-color: white;
      border-bottom: 1px solid #ecf2f8;
      border-right: 1px solid #ecf2f8dd;
      height: 60px;
      position: relative;
    }

    .activity {
      padding: 13px 7px;
      border-radius: 4px;
      font-size: 14px;
      text-align: center;
      cursor: pointer;
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .activity.empty {
      background-color: white;
      color: #0533544D;
      cursor: pointer;
    }

    .activity.empty > span {
      color: #3ACF99;
    }

    .activity.empty:hover {
      background-color: #f8f9fa;
    }

    .activity.reservation {
      background-color: #dafaee;
      color: #3acf99;
    }

    .activity.off {
      background-color: #ff93a6;
      cursor: default;
    }

    .activity.off.yellow {
      background-color: #FFFFF5;
    }

    .white-circle {
      position: absolute;
      top: 5px;
      right: 5px;
      height: 18px;
      width: 18px;
      background-color: white;
      border-radius: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }

    .white-circle > img {
      width: 6px;
      height: 6px;
    }

    .arrow {
      background: none;
      border: none;
      cursor: pointer;
      padding: 5px;
      font-size: 16px;
      color: #053354;
    }

    .arrow:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class CalendarComponent implements OnInit, OnDestroy {
  @Input() doctorId!: number;
  @Input() viewMode: 'doctor' | 'patient' = 'patient';

  currentYear: number = new Date().getFullYear();
  currentMonthName: string = '';
  currentDate: Date = new Date();
  displayedWeek: Date[] = [];
  showBookingModal = false;
  selectedDate: Date | null = null;
  selectedTimeSlot: string | null = null;

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

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userId = this.authService.getUserId();
    this.updateWeek();
    this.loadInitialData();
    this.subscribeToAppointments();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadInitialData() {
    if (this.viewMode === 'doctor') {
      await firstValueFrom(this.appointmentService.loadDoctorAppointments());
    } else {
      await firstValueFrom(this.appointmentService.loadPatientAppointments());
    }
    await this.loadAvailableSlots();
  }

  private subscribeToAppointments() {
    const appointmentsObservable = this.viewMode === 'doctor' 
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
        const slots = await firstValueFrom(
          this.appointmentService.getAvailableSlots(this.doctorId, this.currentDate)
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

    if (appointment) {
      return appointment.patientId.toString() === this.userId ? 'own' : 'booked';
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

    const isAvailable = await firstValueFrom(
      this.appointmentService.checkSlotAvailability(this.doctorId, date, timeSlot)
    );

    if (!isAvailable) {
      alert('This time slot is no longer available');
      return;
    }

    this.selectedDate = date;
    this.selectedTimeSlot = timeSlot;
    this.showBookingModal = true;
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