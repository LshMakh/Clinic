import { Component } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { catchError, debounceTime, map, Observable, of } from 'rxjs';
import { User } from '../../Models/Patient.model';

@Component({
  selector: 'app-doctor-registration',
  templateUrl: './doctor-registration.component.html',
  styleUrl: './doctor-registration.component.css'
})
export class DoctorRegistrationComponent {

  registerForm:FormGroup;
  errorMessage:string = '';
  isSubmitting:boolean=false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email], [this.emailExistsValidator()]],
      personalNumber: ['', [
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11),
        Validators.pattern('^[0-9]*$')
      ]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      specialty: ['', Validators.required],
      photoUrl: [''],
      cvUrl: ['']
    });
  }

  private emailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      // Don't validate empty or invalid email format
      if (!control.value || !control.value.trim() || control.hasError('email')) {
        return of(null);
      }

      return this.authService.checkEmailExists(control.value).pipe(
        debounceTime(300), // Wait for user to stop typing
        map(exists => exists ? { emailExists: true } : null),
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
  
        const doctorData = {
          ...this.registerForm.value,
          role: 'DOCTOR',
          userId: 0 // This will be assigned by the backend
        };
  
        this.authService.addDoctor(doctorData).subscribe({
          next: (response) => {
            console.log('Doctor registration successful:', response);
            this.router.navigate(['/main']);
          },
          error: (error) => {
            console.error('Registration error:', error);
            this.errorMessage = error.message || 'Registration failed';
            this.isSubmitting = false;
          },
          complete: () => {
            this.isSubmitting = false;
          }
        });
      }
    }

}
