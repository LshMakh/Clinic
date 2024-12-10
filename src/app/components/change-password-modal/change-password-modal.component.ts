import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.css'],
})
export class ChangePasswordModalComponent {
  @Output() close = new EventEmitter<void>();

  changePasswordForm: FormGroup;
  isSubmitting = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'error';
  showAlert = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.changePasswordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit(): void {
    if (this.changePasswordForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.hideAlert();

      const { currentPassword, newPassword, confirmPassword } =
        this.changePasswordForm.value;

      this.authService
        .changePassword(currentPassword, newPassword, confirmPassword)
        .subscribe({
          next: (response) => {
            this.showSuccessAlert('პაროლი წარმატებით შეიცვალა');
            this.isSubmitting = false;
            setTimeout(() => {
              this.onClose();
            }, 2000);
          },
          error: (error) => {
            this.showErrorAlert(
              error.error?.message || 'დაფიქსირდა შეცდომა, სცადეთ თავიდან'
            );
            this.isSubmitting = false;
          },
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
