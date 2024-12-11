import { Component, OnInit, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { DoctorCard } from '../../Models/doctorCard.model';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DoctorService } from '../../services/doctor.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';



@Component({
  selector: 'app-search-dropdown',
  templateUrl: './search-dropdown.component.html',
  styleUrls: ['./search-dropdown.component.css']
})
export class SearchDropdownComponent implements OnInit, OnDestroy {
  nameSearch: string = '';
  specialtySearch: string = '';
  searchResults$: Observable<DoctorCard[]>;
  showDropdown$: Observable<boolean>;
  private destroy$ = new Subject<void>();
  private photoSubscriptions = new Map<number, Subscription>();
  doctorPhotos = new Map<number, string>();
  loadingPhotos = new Set<number>();
  searchResultsWithPhotos$: Observable<DoctorCard[]>;
  private defaultPhotoUrl: SafeUrl;



  constructor(
    private searchService: SearchService,
    private router: Router,
    private elementRef: ElementRef,
    private doctorService:DoctorService,
    private sanitizer: DomSanitizer
    
  ) {
    this.searchResults$ = this.searchService.getSearchResults();
    this.showDropdown$ = this.searchService.getShowDropdown();
    this.defaultPhotoUrl = this.sanitizer.bypassSecurityTrustUrl('assets/png-clipart-anonymous-person-login-google-account-computer-icons-user-activity-miscellaneous-computer.png');

    this.searchResultsWithPhotos$ = this.searchService.getSearchResults().pipe(
      switchMap(doctors => {
        const doctorsWithPhotos = doctors.map(doctor => ({
          ...doctor,
          photoUrl: this.defaultPhotoUrl // Set default initially
        }));

        // Load all photos
        doctors.forEach(doctor => {
          this.doctorService.getDoctorPhoto(doctor.doctorId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (photoUrl) => {
                const index = doctorsWithPhotos.findIndex(d => d.doctorId === doctor.doctorId);
                if (index !== -1) {
                  doctorsWithPhotos[index].photoUrl = photoUrl;
                }
              },
              error: () => {
                const index = doctorsWithPhotos.findIndex(d => d.doctorId === doctor.doctorId);
                if (index !== -1) {
                  doctorsWithPhotos[index].photoUrl = this.defaultPhotoUrl;
                }
              }
            });
        });

        return new BehaviorSubject(doctorsWithPhotos);
      })
    );
   
  }

  ngOnInit() {
  }

  loadDoctorPhoto(doctorId: number): void {
    if (this.photoSubscriptions.has(doctorId)) {
      return; 
    }

    this.loadingPhotos.add(doctorId);
    
    const subscription = this.doctorService.getDoctorPhoto(doctorId)
      .pipe(
        finalize(() => this.loadingPhotos.delete(doctorId))
      )
      .subscribe({
        next: (photoUrl) => {
          this.doctorPhotos.set(doctorId, photoUrl);
        },
        error: () => {
         
          this.doctorPhotos.set(doctorId, '/assets/default-doctor.png');
        }
      });

    this.photoSubscriptions.set(doctorId, subscription);
  }

  getDoctorPhoto(doctorId: number): string {
    if (!this.doctorPhotos.has(doctorId)) {
      this.loadDoctorPhoto(doctorId);
      return 'assets/png-clipart-anonymous-person-login-google-account-computer-icons-user-activity-miscellaneous-computer.png'; 
    }
    return this.doctorPhotos.get(doctorId) || '/assets/default-doctor.png';
  }

  onNameSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchService.setNameSearch(value);
  }

  onSpecialtySearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchService.setSpecialtySearch(value);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.searchService.closeDropdown();
    }
  }

  onDoctorClick(doctor: DoctorCard) {
    this.router.navigate(['/book-appointment/'+ doctor.doctorId]);
    this.searchService.closeDropdown();
  }

  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}