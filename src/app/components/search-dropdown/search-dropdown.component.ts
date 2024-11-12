// search-dropdown.component.ts
import { Component, OnInit, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { DoctorCard } from '../../Models/doctorCard.model';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

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

  constructor(
    private searchService: SearchService,
    private router: Router,
    private elementRef: ElementRef
  ) {
    this.searchResults$ = this.searchService.getSearchResults();
    this.showDropdown$ = this.searchService.getShowDropdown();
  }

  ngOnInit() {
    // Initialize component
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
    this.router.navigate(['/patient/book-appointment/'+ doctor.doctorId]);
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