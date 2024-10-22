import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../Models/Patient.model';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent {


  registerForm: FormGroup;
  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      personalNumber: ['', [
        Validators.required, 
        Validators.minLength(11), 
        Validators.maxLength(11),
        Validators.pattern('^[0-9]*$')
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8)
      ]]
    });
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const userData: User = {
        userId: 0,
        firstName: this.registerForm.value.firstName,
        lastName: this.registerForm.value.lastName,
        email: this.registerForm.value.email,
        personalNumber: this.registerForm.value.personalNumber,
        password: this.registerForm.value.password,
        role: 'Patient'
      };

      console.log('Submitting user data:', userData);

      this.authService.addUser(userData).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          alert('Registration successful!');
         
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.errorMessage = error.message;
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

}

