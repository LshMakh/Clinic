import { Component, OnInit, OnDestroy } from '@angular/core';
import { VisibilityService } from '../../services/visibility.service';
import { DoctorCard } from '../../Models/doctorCard.model';
import { DoctorService } from '../../services/doctor.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { filter, finalize } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { PhotoManagerService } from '../../services/photo-manager.service';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.css'],
})
export class AdminProfileComponent implements OnInit, OnDestroy {
  isVisible: boolean = false;
  isEditVisible: boolean = false;
  doctor: any = null;
  photoUrl:SafeUrl|undefined;

  editForm: FormGroup;
  isSubmitting = false;
  uploadedPhoto: File | null = null;
  uploadedCV: File | null = null;
  photoPreview: string | null = null;
  successMessage: string = '';
  errorMessage: string = '';
  private routerSubscription: Subscription | undefined;
  appointmentCount: number = 0;
  doctorId: number = 0;
  isEditCalendar: boolean = false;
  isDeleteCalendar: boolean = false;
  appointmentCount$!: Observable<number>;

  private subscriptions: Subscription[] = [];
  

  specialties: string[] = [
    'ნევროლოგი',
    'ოფთალმოლოგი',
    'დერმატოლოგი',
    'ორთოპედი',
    'გინეკოლოგი',
    'ენდოკრინოლოგი',
    'უროლოგი',
    'გასტროენტეროლოგი',
    'ოტორინოლარინგოლოგი',
    'პულმონოლოგი',
    'რევმატოლოგი',
    'ონკოლოგი',
    'ნეფროლოგი',
    'ჰემატოლოგი',
    'ალერგოლოგი',
    'იმუნოლოგი',
    'ფსიქიატრი',
    'ნეიროქირურგი',
  ];

  constructor(
    private fb: FormBuilder,
    private visibilityService: VisibilityService,
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private route: ActivatedRoute,
    private router: Router,
    private photoManager:PhotoManagerService
  ) {
    this.editForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      personalNumber: [
        '',
        [
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      specialty: ['', Validators.required],
    });

    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
          this.visibilityService.setVisibility(false);
        }
      });
  }

  ngOnInit() {
    this.subscriptions.push(
      this.visibilityService.isVisible$.subscribe((visible) => {
        this.isVisible = visible;

        if (this.isVisible) {
          const id = this.route.snapshot.paramMap.get('id');
          if (id) {
            this.loadDoctorDetails(Number(id));
            this.doctorId = Number(id);
          } else {
            this.visibilityService.setVisibility(false);
          }
        }
      })
    );

    this.subscriptions.push(
      this.visibilityService.isEditVisible$.subscribe((visible) => {
        this.isEditVisible = visible;
      })
    );

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.visibilityService.setVisibility(false);
    }

    this.appointmentCount$ = this.appointmentService.appointmentCount$;
    this.appointmentService.getSelectedDoctorAppointmentCount;
  }

  loadDoctorDetails(id: number) {
    if (!id) return;

    this.doctorService.getDoctorById(id).subscribe({
      next: (data) => {
        this.doctor = data;
        this.loadDoctorPhoto(id);
        this.appointmentService
          .getSelectedDoctorAppointmentCount(id)
          .subscribe();
      },
      error: (error) => {
        console.error('Error loading doctor details:', error);
      },
    });
  }

  private loadDoctorPhoto(doctorId: number) {
    this.photoManager.getPhoto(doctorId).subscribe({
      next: (url) => {
        this.photoUrl = url;
      },
      error: (error) => {
        console.error('Error loading doctor photo:', error);
      }
    });
  }

  
  toggleEditVisibility(): void {
    this.isEditVisible = !this.isEditVisible;
    this.isDeleteCalendar = !this.isDeleteCalendar;
    this.isEditCalendar = !this.isEditCalendar;
    if (this.isEditVisible && this.doctor) {
      this.editForm.patchValue({
        firstName: this.doctor.firstName,
        lastName: this.doctor.lastName,
        email: this.doctor.email,
        personalNumber: this.doctor.personalNumber,
        specialty: this.doctor.specialty,
      });
    }
  }
  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (
        file.type.match(/image\/(jpeg|png)/) &&
        file.size <= 5 * 1024 * 1024
      ) {
        this.uploadedPhoto = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.photoPreview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        this.errorMessage =
          'Please select a valid image file (JPEG/PNG, max 5MB)';
      }
    }
  }

  onCVSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024) {
        this.uploadedCV = file;
      } else {
        this.errorMessage = 'Please select a valid PDF file (max 10MB)';
      }
    }
  }

  saveChanges(): void {
    if (this.editForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const formData = new FormData();
        const formValue = this.editForm.value;

        // Only append changed values
        Object.keys(formValue).forEach((key) => {
          if (this.doctor[key] !== formValue[key]) {
            formData.append(key, formValue[key]);
          }
        });

        if (this.uploadedPhoto) {
          formData.append('photo', this.uploadedPhoto);
        }

        if (this.uploadedCV) {
          formData.append('cv', this.uploadedCV);
        }

        this.doctorService
          .updateDoctor(this.doctor.doctorId, formData)
          .subscribe({
            next: () => {
              this.successMessage = 'Doctor information updated successfully';
              this.loadDoctorDetails(this.doctor.doctorId);
              this.isEditVisible = false;
              this.isDeleteCalendar = false;
              this.isEditCalendar = false;
              this.isSubmitting = false;
            },
            error: (error) => {
              if (
                error.status === 200 ||
                (error.error && error.error.success)
              ) {
                this.successMessage = 'Doctor information updated successfully';
                this.loadDoctorDetails(this.doctor.doctorId);
                this.isEditVisible = false;
              } else {
                this.errorMessage =
                  error.message || 'Failed to update doctor information';
                console.error('Update error:', error);
              }
              this.isSubmitting = false;
            },
          });
      } catch (error: any) {
        this.errorMessage =
          error.message || 'Failed to update doctor information';
        console.error('Update error:', error);
        this.isSubmitting = false;
      }
    }
  }
  cancelEdit(): void {
    this.isEditVisible = false;
    this.isDeleteCalendar = false;
    this.isEditCalendar = false;
    this.uploadedPhoto = null;
    this.uploadedCV = null;
    this.photoPreview = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  toggleVisibility() {
    this.visibilityService.toggleVisibility();
  }

  getStarsArray(rating: number): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => (i < rating ? 1 : 0));
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
   
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
