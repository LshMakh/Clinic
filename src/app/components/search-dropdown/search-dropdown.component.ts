import { Component, OnInit, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { DoctorCard } from '../../Models/doctorCard.model';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { finalize, map, switchMap, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DoctorService } from '../../services/doctor.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PhotoManagerService } from '../../services/photo-manager.service';



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

  constructor(
    private searchService: SearchService,
    private router: Router,
    private elementRef: ElementRef,
    private doctorService:DoctorService,
    private sanitizer: DomSanitizer,
    private photoManager:PhotoManagerService
    
  ) {
    this.searchResults$ = this.searchService.getSearchResults().pipe(
      switchMap(doctors => {
        // Load photos for all doctors
        doctors.forEach(doctor => {
          if (!doctor.photoUrl) {
            this.photoManager.getPhoto(doctor.doctorId)
              .pipe(takeUntil(this.destroy$))
              .subscribe(url => {
                doctor.photoUrl = url;
              });
          }
        });
        return Promise.resolve(doctors);
      }),
      // Sort or manipulate results as needed
      map(doctors => doctors)
    );

    this.showDropdown$ = this.searchService.getShowDropdown();
   
  }

  ngOnInit() {
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