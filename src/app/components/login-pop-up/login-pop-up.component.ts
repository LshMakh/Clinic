// login-pop-up.component.ts
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login-pop-up',
  templateUrl: './login-pop-up.component.html',
  styleUrls: ['./login-pop-up.component.css']
})
export class LoginPopUpComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  loginForm: FormGroup;
  isLoading: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'error';
  showAlert: boolean = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {}

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.hideAlert();

      const loginData = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      this.authService.authenticate(loginData).subscribe({
        next: (response) => {
          this.showSuccessAlert('Login successful!');
          
            this.close.emit();
        },
        error: (error) => {
          this.showErrorAlert(error.message || 'Invalid email or password');
          this.isLoading = false;
        }
      });
    } else {
      this.showErrorAlert('Please fill in all required fields correctly');
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