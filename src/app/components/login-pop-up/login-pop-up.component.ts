import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-login-pop-up',
  templateUrl: './login-pop-up.component.html',
  styleUrl: './login-pop-up.component.css'
})
export class LoginPopUpComponent {
  @Output() close = new EventEmitter<void>();
  showActivationCode = false;
  showResendCode = false;

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    // Implement login logic here
    console.log('Login submitted');
  }

  toggleActivationCode(): void {
    this.showActivationCode = !this.showActivationCode;
  }

  resendCode(): void {
    // Implement resend code logic here
    console.log('Code resent');
    this.showResendCode = true;
  }

}
