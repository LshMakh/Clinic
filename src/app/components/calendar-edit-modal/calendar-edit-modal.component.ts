import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface EditEvent {
  appointmentId: number;
  description: string;
}

@Component({
  selector: 'app-calendar-edit-modal',
  templateUrl:'./calendar-edit-modal.component.html',
 styleUrl:'./calendar-edit-modal.component.css'
})


export class CalendarEditModalComponent {
  @Input() appointmentId!: number;
  @Input() currentDescription: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<EditEvent>();

  editForm: FormGroup;
  isSubmitting = false;
  showAlert = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'error';

  constructor(private fb: FormBuilder) {
    this.editForm = this.fb.group({
      description: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit() {
    this.editForm.patchValue({
      description: this.currentDescription
    });
  }

  onSubmit(): void {
    if (this.editForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const description = this.editForm.get('description')?.value;
      
      this.saved.emit({
        appointmentId: this.appointmentId,
        description: description
      });

      this.showSuccessAlert('ვიზიტის აღწერა წარმატებით შეიცვალა');
      setTimeout(() => {
        this.onClose();
      }, 1500);
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

  onClose(): void {
    this.close.emit();
  }
}