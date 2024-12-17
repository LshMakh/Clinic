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
