import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { User } from '../../Models/Patient.model';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  debounceTime,
  first,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
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
      email: [
        '',
        [Validators.required, Validators.email],
        [this.emailExistsValidator()],
      ],
      personalNumber: [
        '',
        [
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }
  private emailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      // Don't validate empty or invalid email format
      if (
        !control.value ||
        !control.value.trim() ||
        control.hasError('email')
      ) {
        return of(null);
      }

      return this.authService.checkEmailExists(control.value).pipe(
        debounceTime(300), // Wait for user to stop typing
        map((exists) => (exists ? { emailExists: true } : null)),
        catchError(() => of(null)) // Handle errors gracefully
      );
    };
  }

  // Getter for easy access in template
  get email() {
    return this.registerForm.get('email');
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
        role: 'Patient',
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
        },
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }
}
