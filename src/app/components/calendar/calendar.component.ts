import { Component, OnInit, Input } from '@angular/core';
import { Appointment,AppointmentService } from '../../services/appointment.service';
interface TimeSlot {
  time: string;
  isSelected: boolean;
  isAvailable: boolean;
}

interface DayInfo {
  name: string;
  date: number;
  fullDate: Date;
  timeSlots: TimeSlot[];
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  @Input() isDoctorView: boolean = false;
  @Input() userId: number | null = null;
  @Input() doctorId: number | null = null;

  weekDays: DayInfo[] = [];
  timeSlots = [
    '9:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00',
    '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'
  ];
  currentDate: Date;
  monthNames = [
    'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
    'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
  ];
  dayNames = ['კვი', 'ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ'];

  showPopup: boolean = false;
  selectedDay: DayInfo | null = null;
  selectedSlot: TimeSlot | null = null;
  appointmentDescription: string = '';

  constructor(private appointmentService: AppointmentService) {
    this.currentDate = new Date();
  }

  ngOnInit(): void {
    this.updateWeekDays();
  }

  updateWeekDays(): void {
    this.weekDays = [];
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay() + 1);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      this.weekDays.push({
        name: this.dayNames[day.getDay()],
        date: day.getDate(),
        fullDate: new Date(day),
        timeSlots: this.timeSlots.map(time => ({
          time,
          isSelected: false,
          isAvailable: this.isDoctorView ? false : this.appointmentService.isTimeSlotAvailable(this.doctorId!, day, time)
        }))
      });
    }

    if (this.isDoctorView && this.doctorId) {
      this.loadDoctorAppointments();
    } else if (this.userId) {
      this.loadUserAppointments();
    }
  }

  loadDoctorAppointments(): void {
    this.appointmentService.getDoctorAppointments(this.doctorId!).subscribe(appointments => {
      this.updateCalendarWithAppointments(appointments);
    });
  }

  loadUserAppointments(): void {
    this.appointmentService.getUserAppointments(this.userId!).subscribe(appointments => {
      this.updateCalendarWithAppointments(appointments);
    });
  }

  updateCalendarWithAppointments(appointments: Appointment[]): void {
    appointments.forEach(appointment => {
      const dayIndex = this.weekDays.findIndex(day => 
        day.fullDate.toDateString() === appointment.date.toDateString()
      );
      if (dayIndex !== -1) {
        const timeSlotIndex = this.weekDays[dayIndex].timeSlots.findIndex(slot => 
          slot.time === appointment.timeSlot
        );
        if (timeSlotIndex !== -1) {
          this.weekDays[dayIndex].timeSlots[timeSlotIndex].isSelected = true;
          this.weekDays[dayIndex].timeSlots[timeSlotIndex].isAvailable = false;
        }
      }
    });
  }

  changeWeek(direction: 'prev' | 'next'): void {
    const daysToAdd = direction === 'next' ? 7 : -7;
    this.currentDate.setDate(this.currentDate.getDate() + daysToAdd);
    this.updateWeekDays();
  }

  changeMonth(direction: 'prev' | 'next'): void {
    const monthsToAdd = direction === 'next' ? 1 : -1;
    this.currentDate.setMonth(this.currentDate.getMonth() + monthsToAdd);
    this.updateWeekDays();
  }

   toggleTimeSlot(day: DayInfo, slot: TimeSlot): void {
    if (!this.isDoctorView && slot.isAvailable && !slot.isSelected) {
      this.selectedDay = day;
      this.selectedSlot = slot;
      this.showPopup = true;
    }
  }
  bookAppointment(): void {
    if (this.selectedDay && this.selectedSlot && this.userId && this.doctorId) {
      const newAppointment: Appointment = {
        id: Math.floor(Math.random() * 1000000),
        doctorId: this.doctorId,
        userId: this.userId,
        date: this.selectedDay.fullDate,
        timeSlot: this.selectedSlot.time,
        description: this.appointmentDescription
      };

      this.appointmentService.addAppointment(newAppointment);
      this.selectedSlot.isSelected = true;
      this.selectedSlot.isAvailable = false;
      this.closePopup();
    }
  }
  closePopup(): void {
    this.showPopup = false;
    this.selectedDay = null;
    this.selectedSlot = null;
    this.appointmentDescription = '';
  }

  get currentMonth(): string {
    return this.monthNames[this.currentDate.getMonth()];
  }

  get currentYear(): number {
    return this.currentDate.getFullYear();
  }
}