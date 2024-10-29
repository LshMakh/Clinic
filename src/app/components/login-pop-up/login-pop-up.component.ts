import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { supportsPassiveEventListeners } from '@angular/cdk/platform';
import { UserLoginDto } from '../../Models/Login.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login-pop-up',
  templateUrl: './login-pop-up.component.html',
  styleUrl: './login-pop-up.component.css'
})
export class LoginPopUpComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  currentUser$! : Observable<any>;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.currentUser$ = this.authService.getCurrentUser();
    
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginData: UserLoginDto = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      this.authService.authenticate(loginData).subscribe({
        next: (response) => {
          console.log('Login successful', response);
          this.close.emit();
          console.log(this.currentUser$);
        },
        error: (error) => {
          console.error('Login error:', error);
          this.errorMessage = error.message || 'Authentication failed';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields';
    }
  }

  onClose(){
    this.close.emit();
  }

  // toggleActivationCode(): void {
  //   this.showActivationCode = !this.showActivationCode;
  // }

  // resendCode(): void {
  
  //   console.log('Code resent');
  //   this.showResendCode = true;
  // }

}
