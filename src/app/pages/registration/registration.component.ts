import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { catchError, debounceTime, first, map, Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  isSubmitting: boolean = false;
  isVerificationSent: boolean = false;

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
      verificationCode: ['']
    });

    // Add verification code validator when verification is sent
    this.registerForm.get('verificationCode')?.setValidators([
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6),
      Validators.pattern('^[0-9]*$')
    ]);
  }

  private emailExistsValidator() {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || !control.value.trim() || control.hasError('email')) {
        return of(null);
      }

      return control.valueChanges.pipe(
        debounceTime(1000),
        switchMap(value => 
          this.authService.checkEmailExists(value).pipe(
            map(exists => exists ? { emailExists: true } : null),
            catchError(() => of(null))
          )
        ),
        first()
      );
    };
  }

  get email() { return this.registerForm.get('email'); }
  get verificationCode() { return this.registerForm.get('verificationCode'); }

  isFormValid(): boolean {
    return this.registerForm.valid && 
           (!this.isVerificationSent || (this.verificationCode?.valid ?? false));
}

  sendEmailVerification() {
    if (this.email?.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      this.authService.sendVerificationCode(this.email.value).subscribe({
        next: () => {
          this.isVerificationSent = true;
          this.isSubmitting = false;
          alert('გთხოვთ შეამოწმოთ თქვენი ელ-ფოსტა ვერიფიკაციის კოდისთვის');
        },
        error: (error) => {
          this.errorMessage = 'ვერიფიკაციის კოდის გაგზავნა ვერ მოხერხდა';
          this.isSubmitting = false;
          console.error('Error sending verification code:', error);
        }
      });
    }
  }

  async onRegister() {
    if (this.isFormValid()) {
      this.isSubmitting = true;
      this.errorMessage = '';

      try {
        if (this.isVerificationSent) {
          // Verify the code first
          await this.authService
            .verifyCode(this.email?.value, this.verificationCode?.value)
            .toPromise();
        }

        // Proceed with registration
        const userData = {
          userId: 0,
          firstName: this.registerForm.value.firstName,
          lastName: this.registerForm.value.lastName,
          email: this.registerForm.value.email,
          personalNumber: this.registerForm.value.personalNumber,
          password: this.registerForm.value.password,
          role: 'PATIENT'
        };

        await this.authService.addUser(userData).toPromise();
        
        alert('რეგისტრაცია წარმატებით დასრულდა!');
        this.router.navigate(['/main']);
      } catch (error: any) {
        console.error('Registration error:', error);
        this.errorMessage = error.message || 'Registration failed';
      } finally {
        this.isSubmitting = false;
      }
    } else {
      this.errorMessage = 'გთხოვთ შეავსოთ ყველა სავალდებულო ველი';
    }
  }
}