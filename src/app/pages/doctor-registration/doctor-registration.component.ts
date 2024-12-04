import { Component } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { catchError, debounceTime, map, Observable, of } from 'rxjs';
import { User } from '../../Models/Patient.model';

@Component({
  selector: 'app-doctor-registration',
  templateUrl: './doctor-registration.component.html',
  styleUrls: ['./doctor-registration.component.css']
})
export class DoctorRegistrationComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  isSubmitting: boolean = false;
  photoPreview: string | null = null;
  cvFileName: string | null = null;

  specialties = [
    { name: 'ნევროლოგი' }, { name: 'ოფთალმოლოგი' }, { name: 'დერმატოლოგი' },
    { name: 'ორთოპედი' }, { name: 'გინეკოლოგი' }, { name: 'ენდოკრინოლოგი' },
    { name: 'უროლოგი' }, { name: 'გასტროენტეროლოგი' }, { name: 'ოტორინოლარინგოლოგი' },
    { name: 'პულმონოლოგი' }, { name: 'რევმატოლოგი' }, { name: 'ონკოლოგი' },
    { name: 'ნეფროლოგი' }, { name: 'ჰემატოლოგი' }, { name: 'ალერგოლოგი' },
    { name: 'იმუნოლოგი' }, { name: 'ფსიქიატრი' }, { name: 'ნეიროქირურგი' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(15)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email], [this.emailExistsValidator()]],
      personalNumber: ['', [
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11),
        Validators.pattern('^[0-9]*$')
      ]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      specialty: ['', Validators.required],
      photo: [null, Validators.required],
      cv: [null, Validators.required]
    });
  }

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

  get email() { return this.registerForm.get('email'); }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (!file.type.match(/image\/(jpeg|png)/)) {
        this.errorMessage = 'Please select a valid image file (JPEG or PNG)';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size should not exceed 5MB';
        return;
      }

      this.registerForm.patchValue({ photo: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onCVSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.errorMessage = 'Please select a valid PDF file';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.errorMessage = 'CV size should not exceed 10MB';
        return;
      }

      this.registerForm.patchValue({ cv: file });
      this.cvFileName = file.name;
    }
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const formData = new FormData();
      const formValue = this.registerForm.value;

      formData.append('photo', formValue.photo);
      formData.append('cv', formValue.cv);

      Object.keys(formValue).forEach(key => {
        if (key !== 'photo' && key !== 'cv') {
          formData.append(key, formValue[key]);
        }
      });

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
    }
  }
}