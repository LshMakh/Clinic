import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface EditEvent {
  appointmentId: number;
  description: string;
}

@Component({
  selector: 'app-calendar-edit-modal',
  template: `
   <div class="modal-overlay" (click)="onClose()"></div>
    <div class="modal-container">
      <h2>ვიზიტის აღწერის შეცვლა</h2>
      
      <div *ngIf="showAlert" 
           [class]="'alert ' + (alertType === 'success' ? 'alert-success' : 'alert-error')">
        {{ alertMessage }}
      </div>

      <div class="modal-content">
        <form [formGroup]="editForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <textarea 
              formControlName="description" 
              placeholder="ვიზიტის მიზეზი"
              rows="4"
              [class.invalid]="editForm.get('description')?.invalid && 
                              editForm.get('description')?.touched">
            </textarea>
            <div class="error-message" 
                 *ngIf="editForm.get('description')?.invalid && 
                        editForm.get('description')?.touched">
              <span *ngIf="editForm.get('description')?.errors?.['required']">
                აღწერის ველის შევსება აუცილებელია
              </span>
              <span *ngIf="editForm.get('description')?.errors?.['maxlength']">
                აღწერა არ უნდა აღემატებოდეს 500 სიმბოლოს
              </span>
            </div>
          </div>

          <div class="button-group">
            <button type="button" class="cancel-button" (click)="onClose()">გაუქმება</button>
            <button type="submit" 
                    class="submit-button" 
                    [disabled]="!editForm.valid || isSubmitting">
              {{ isSubmitting ? 'მიმდინარეობს...' : 'შენახვა' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1000;
    }

    .modal-container {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 400px;
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 1001;
      animation: fadeIn 0.3s ease;
    }

    .modal-content {
      display: flex;
      flex-direction: column;
    }

    h2 {
      color: #18a4e1;
      margin-bottom: 30px;
      font-size: 24px;
      text-align: center;
    }

    .form-group {
      margin-bottom: 20px;
      position: relative;
    }

    textarea {
      width: 100%;
      padding: 12px 15px;
      border: 1px solid #18a4e180;
      border-radius: 8px;
      font-size: 16px;
      resize: vertical;
      min-height: 100px;
      transition: border-color 0.3s ease;
    }

    textarea:focus {
      outline: none;
      border-color: #18A4E1;
    }

    textarea.invalid {
      border-color: #ff4444;
    }

    .error-message {
      color: #ff4444;
      font-size: 12px;
      margin-top: 5px;
      padding-left: 15px;
    }

    .alert {
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 20px;
      text-align: center;
      font-size: 14px;
    }

    .alert-success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .alert-error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .button-group {
      display: flex;
      gap: 15px;
      margin-top: 20px;
    }

    .cancel-button, .submit-button {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 25px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .cancel-button {
      background-color: #f5f5f5;
      color: #666;
    }

    .cancel-button:hover {
      background-color: #e0e0e0;
    }

    .submit-button {
      background-color: #3ACF99;
      color: white;
    }

    .submit-button:hover:not(:disabled) {
      background-color: #18A4E1;
    }

    .submit-button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translate(-50%, -48%);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
    }

    @media (max-width: 480px) {
      .modal-container {
        width: 90%;
        padding: 20px;
      }

      h2 {
        font-size: 20px;
        margin-bottom: 20px;
      }

      textarea {
        font-size: 14px;
      }

      .button-group button {
        font-size: 14px;
        padding: 10px;
      }
    }
  `]
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