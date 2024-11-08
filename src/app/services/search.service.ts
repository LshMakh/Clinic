import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { DoctorCard } from '../Models/doctorCard.model';
import { DoctorService } from './doctor.service';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private nameSearchSubject = new BehaviorSubject<string>('');
  private specialtySearchSubject = new BehaviorSubject<string>('');
  private showDropdownSubject = new BehaviorSubject<boolean>(false);
  private searchResultsSubject = new BehaviorSubject<DoctorCard[]>([]);

  constructor(private doctorService: DoctorService) {
    // Combine name and specialty search
    combineLatest([
      this.nameSearchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ),
      this.specialtySearchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ),
      this.doctorService.getFilteredCards()
    ]).subscribe(([nameSearch, specialtySearch, doctors]) => {
      const results = this.filterDoctors(doctors, nameSearch, specialtySearch);
      this.searchResultsSubject.next(results);
      this.showDropdownSubject.next(results.length > 0 && (nameSearch.length > 0 || specialtySearch.length > 0));
    });
  }

  private filterDoctors(doctors: DoctorCard[], nameSearch: string, specialtySearch: string): DoctorCard[] {
    return doctors.filter(doctor => {
      const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
      const specialty = doctor.specialty.toLowerCase();
      const nameMatch = nameSearch ? fullName.includes(nameSearch.toLowerCase()) : true;
      const specialtyMatch = specialtySearch ? specialty.includes(specialtySearch.toLowerCase()) : true;
      return nameMatch && specialtyMatch;
    });
  }

  // Setters for search terms
  setNameSearch(term: string) {
    this.nameSearchSubject.next(term);
  }

  setSpecialtySearch(term: string) {
    this.specialtySearchSubject.next(term);
  }

  // Observable getters
  getNameSearch(): Observable<string> {
    return this.nameSearchSubject.asObservable();
  }

  getSpecialtySearch(): Observable<string> {
    return this.specialtySearchSubject.asObservable();
  }

  getSearchResults(): Observable<DoctorCard[]> {
    return this.searchResultsSubject.asObservable();
  }

  getShowDropdown(): Observable<boolean> {
    return this.showDropdownSubject.asObservable();
  }

  // Method to close dropdown
  closeDropdown() {
    this.showDropdownSubject.next(false);
  }
}