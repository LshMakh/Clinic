import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-pop-up',
  templateUrl: './login-pop-up.component.html',
  styleUrls: ['./login-pop-up.component.css']
})
export class LoginPopUpComponent {
  @Output() close = new EventEmitter<void>();
  loginForm: FormGroup;
  forgotPasswordForm: FormGroup;
  isSubmitting = false;
  showForgotPassword = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'error';
  showAlert = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      this.hideAlert();

      const loginData = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      this.authService.authenticate(loginData).subscribe({
        next: (response) => {
          this.showSuccessAlert('Login successful!');
          this.router.navigate(['/main']);
          this.close.emit();
        },
        error: (error) => {
          this.showErrorAlert(error.message);
          this.isSubmitting = false;
        }
      });
    } else {
      this.showErrorAlert('Please fill in all required fields correctly');
    }
  }

  onForgotPassword(): void {
    if (this.forgotPasswordForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.hideAlert();

      const email = this.forgotPasswordForm.get('email')?.value;
      
      this.authService.requestPasswordReset(email).subscribe({
        next: (response) => {
          this.showSuccessAlert('პაროლის აღდგენის ინსტრუქცია გამოგზავნილია თქვენს ელ-ფოსტაზე');
          this.isSubmitting = false;
          setTimeout(() => {
            this.toggleForgotPassword(); // Switch back to login form
          }, 3000);
        },
        error: (error) => {
          this.showErrorAlert(error.error?.message || 'An error occurred. Please try again.');
          this.isSubmitting = false;
        }
      });
    }
  }

  toggleForgotPassword(): void {
    this.showForgotPassword = !this.showForgotPassword;
    this.hideAlert();
    // Transfer email if switching to forgot password
    if (this.showForgotPassword && this.loginForm.get('email')?.value) {
      this.forgotPasswordForm.patchValue({
        email: this.loginForm.get('email')?.value
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