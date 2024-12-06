import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-booking-modal',
  templateUrl:'./booking-modal.component.html',
  styleUrl:'./booking-modal.component.css'
})
export class BookingModalComponent {
  @Input() doctorId!: number;
  @Input() appointmentDate!: Date;
  @Input() timeSlot!: string;
  @Output() close = new EventEmitter<void>();
  @Output() booked = new EventEmitter<void>();

  bookingForm: FormGroup;
  isSubmitting = false;
  showAlert = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'error';

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService
  ) {
    this.bookingForm = this.fb.group({
      description: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  onSubmit(): void {
    if (this.bookingForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.hideAlert();

      const appointmentData = {
        doctorId: this.doctorId,
        appointmentDate: this.appointmentDate,
        timeSlot: this.timeSlot,
        description: this.bookingForm.get('description')?.value
      };

      console.log(appointmentData);

      this.appointmentService.createAppointment(appointmentData).subscribe({
        next: () => {
          this.showSuccessAlert('ვიზიტი წარმატებით დაჯავშნულია');
          setTimeout(() => {
            this.booked.emit();
            this.onClose();
          }, 1500);
        },
        error: (error) => {
          let errorMessage = 'დაფიქსირდა შეცდომა';
          
          if (error.status === 409) {
            errorMessage = 'მითითებული დრო უკვე დაკავებულია';
          } else if (error.status === 400) {
            errorMessage = 'გთხოვთ შეამოწმოთ შეყვანილი მონაცემები';
          } else if (error.status === 403) {
            errorMessage = 'თქვენ არ გაქვთ ჯავშნის უფლება';
          }
          
          this.showErrorAlert(errorMessage);
          this.isSubmitting = false;
        }
      });
    }
  }

  showSuccessAlert(message: string): void {
    this.alertMessage = message;
    this.alertType = 'success';
    this.showAlert = true;
  }

  showErrorAlert(message: string): void {
    this.alertMessage = message;
    this.alertType = 'error';
    this.showAlert = true;
  }

  hideAlert(): void {
    this.showAlert = false;
    this.alertMessage = '';
  }

  onClose(): void {
    this.close.emit();
  }
}