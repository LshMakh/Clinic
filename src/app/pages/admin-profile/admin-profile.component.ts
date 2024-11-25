
import { Component, OnInit, OnDestroy } from '@angular/core';
import { VisibilityService } from '../../services/visibility.service';
import { DoctorCard } from '../../Models/doctorCard.model';
import { DoctorService } from '../../services/doctor.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.css']
})
export class AdminProfileComponent implements OnInit, OnDestroy {
  isVisible: boolean = false;
  isEditVisible: boolean = false;
  doctor: any = null;
  photoUrl: string = 'assets/png-clipart-anonymous-person-login-google-account-computer-icons-user-activity-miscellaneous-computer.png';
  isLoadingPhoto: boolean = false;
  photoError: boolean = false;
  
  private subscriptions: Subscription[] = [];
  private photoSubscription: Subscription | null = null;

  constructor(
    private visibilityService: VisibilityService,
    private doctorService: DoctorService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to visibility changes
    this.subscriptions.push(
      this.visibilityService.isVisible$.subscribe(visible => {
        this.isVisible = visible;
        
        if (this.isVisible) {
          const id = this.route.snapshot.paramMap.get('id');
          this.loadDoctorDetails(Number(id));
        }
      })
    );

    this.subscriptions.push(
      this.visibilityService.isEditVisible$.subscribe(visible => {
        this.isEditVisible = visible;
      })
    );
  }

  loadDoctorDetails(id: number) {
    if (!id) return;

    this.doctorService.getDoctorById(id).subscribe({
      next: (data) => {
        this.doctor = data;
        this.loadDoctorPhoto(id);
      },
      error: (error) => {
        console.error('Error loading doctor details:', error);
      }
    });
  }

  loadDoctorPhoto(doctorId: number) {
    if (this.photoSubscription) {
      this.photoSubscription.unsubscribe();
    }

    this.isLoadingPhoto = true;
    this.photoError = false;

    this.photoSubscription = this.doctorService.getDoctorPhoto(doctorId)
      .pipe(
        finalize(() => {
          this.isLoadingPhoto = false;
        })
      )
      .subscribe({
        next: (url) => {
          this.photoUrl = url;
        },
        error: (error) => {
          console.error('Error loading doctor photo:', error);
          this.photoError = true;
          this.photoUrl = '/assets/default-doctor.png';
        }
      });
  }

  retryLoadPhoto() {
    if (this.photoError && this.doctor) {
      this.loadDoctorPhoto(this.doctor.doctorId);
    }
  }

  toggleEditVisibility() {
    this.visibilityService.toggleEditVisibility();
  }

  toggleVisibility() {
    this.visibilityService.toggleVisibility();
  }

  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.photoSubscription) {
      this.photoSubscription.unsubscribe();
    }
  }
}