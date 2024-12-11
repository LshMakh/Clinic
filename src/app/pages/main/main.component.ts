import { Component, OnInit, OnDestroy } from '@angular/core';
import { DoctorService } from '../../services/doctor.service';
import { DoctorCard } from '../../Models/doctorCard.model';
import { combineLatest, finalize, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer } from '@angular/platform-browser';
import { PhotoManagerService } from '../../services/photo-manager.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent implements OnInit, OnDestroy {
  displayedDoctors: DoctorCard[] = [];
  allDoctors: DoctorCard[] = [];
  showAllDoctors: boolean = false;
  readonly CARDS_PER_PAGE = 6;
  private subscription: Subscription = new Subscription();
  private photoSubscriptions = new Map<number, Subscription>();
  doctorPhotos = new Map<number, string>();
  loadingPhotos = new Set<number>();

  constructor(
    public doctorService: DoctorService,
    private authService: AuthService,
    private sanitizer:DomSanitizer,
    private photoManager:PhotoManagerService
  ) {
    
  }

  ngOnInit(): void {
    this.subscription.add(
      combineLatest([
        this.authService.getCurrentUser(),
        this.doctorService.getFilteredCards(),
      ]).subscribe(([user, doctors]) => {


        doctors.forEach(doctor => {
          if (!doctor.photoUrl) {
            this.photoManager.getPhoto(doctor.doctorId).subscribe(url => {
              doctor.photoUrl = url;
            });
          }
        });


        this.allDoctors = doctors;
        this.updateDisplayedDoctors();
      })
    );

    this.loadDoctors();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.photoSubscriptions.forEach((sub) => sub.unsubscribe());
    this.photoSubscriptions.clear();
    this.doctorService.clearPhotoCache();
  }
  loadDoctorPhoto(doctorId: number): void {
    if (this.photoSubscriptions.has(doctorId)) {
      return;
    }

    this.loadingPhotos.add(doctorId);

    const subscription = this.doctorService
      .getDoctorPhoto(doctorId)
      .pipe(finalize(() => this.loadingPhotos.delete(doctorId)))
      .subscribe({
        next: (photoUrl) => {
          this.doctorPhotos.set(doctorId, photoUrl);
        },
        error: () => {
          this.doctorPhotos.set(doctorId, '/assets/default-doctor.png');
        },
      });

    this.photoSubscriptions.set(doctorId, subscription);
  }

  getDoctorPhoto(doctorId: number): string {
    if (!this.doctorPhotos.has(doctorId)) {
      this.loadDoctorPhoto(doctorId);
      return 'assets/png-clipart-anonymous-person-login-google-account-computer-icons-user-activity-miscellaneous-computer.png'; // Show placeholder while loading
    }
    return this.doctorPhotos.get(doctorId) || '/assets/default-doctor.png';
  }

  private loadDoctors(): void {
    this.subscription.add(this.doctorService.getDoctorCard().subscribe());
  }

  private updateDisplayedDoctors(): void {
    this.displayedDoctors = this.showAllDoctors
      ? this.allDoctors
      : this.allDoctors.slice(0, this.CARDS_PER_PAGE);
  }

  toggleShowAll() {
    this.showAllDoctors = !this.showAllDoctors;
    this.updateDisplayedDoctors();
  }

  togglePin(doctorId: number, event: Event): void {
    event.stopPropagation();
    if (!this.authService.getUserId()) {
      return;
    }
    this.doctorService.togglePin(doctorId);
  }
  handleCategorySelected(category: string | null) {
    this.showAllDoctors = false;
    this.doctorService.filterBySpecialty(category);
  }

  getStarsArray(rating: number): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => (i < rating ? 1 : 0));
  }
}
