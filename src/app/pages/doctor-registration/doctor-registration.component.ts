// doctor-registration.component.ts
import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { catchError, debounceTime, map, Observable, of } from 'rxjs';

interface FileValidationError {
  maxSize?: boolean;
  invalidType?: boolean;
}

@Component({
  selector: 'app-doctor-registration',
  templateUrl: './doctor-registration.component.html',
  styleUrls: ['./doctor-registration.component.css']
})
export class DoctorRegistrationComponent implements OnInit {
  registerForm: FormGroup;
  errorMessage: string = '';
  isSubmitting: boolean = false;
  photoFileName: string = '';
  cvFileName: string = '';
  
  readonly MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
  readonly MAX_CV_SIZE = 10 * 1024 * 1024; // 10MB
  readonly ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png'];
  readonly ALLOWED_CV_TYPES = ['application/pdf'];

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
      photoFile: [null, [this.fileValidator(this.MAX_PHOTO_SIZE, this.ALLOWED_PHOTO_TYPES)]],
      cvFile: [null, [this.fileValidator(this.MAX_CV_SIZE, this.ALLOWED_CV_TYPES)]]
    });
  }

  ngOnInit(): void {}

  private emailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || !control.value.trim() || control.hasError('email')) {
        return of(null);
      }

      return this.authService.checkEmailExists(control.value).pipe(
        debounceTime(300),
        map(exists => exists ? { emailExists: true } : null),
        catchError(() => of(null))
      );
    };
  }

  private fileValidator(maxSize: number, allowedTypes: string[]) {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value as File;
      if (!file) return null;

      const errors: FileValidationError = {};

      if (file.size > maxSize) {
        errors.maxSize = true;
      }

      if (!allowedTypes.includes(file.type)) {
        errors.invalidType = true;
      }

      return Object.keys(errors).length ? errors : null;
    };
  }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      this.photoFileName = file.name;
      this.registerForm.patchValue({ photoFile: file });
      this.registerForm.get('photoFile')?.markAsTouched();
    }
  }

  onCVSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      this.cvFileName = file.name;
      this.registerForm.patchValue({ cvFile: file });
      this.registerForm.get('cvFile')?.markAsTouched();
    }
  }

  get email() { return this.registerForm.get('email'); }

  private createFormData(): FormData {
    const formData = new FormData();
    const formValue = this.registerForm.value;

    // Add basic fields
    formData.append('firstName', formValue.firstName);
    formData.append('lastName', formValue.lastName);
    formData.append('email', formValue.email);
    formData.append('personalNumber', formValue.personalNumber);
    formData.append('password', formValue.password);
    formData.append('specialty', formValue.specialty);

    // Add files if selected
    if (formValue.photoFile) {
      formData.append('photoFile', formValue.photoFile);
    }
    if (formValue.cvFile) {
      formData.append('cvFile', formValue.cvFile);
    }

    return formData;
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const formData = this.createFormData();

      this.authService.addDoctor(formData).subscribe({
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
    } else {
      this.errorMessage = 'Please fill in all required fields correctly';
    }
  }
}