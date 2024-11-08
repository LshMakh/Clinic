import { Component, OnInit, OnDestroy } from '@angular/core';
import { DoctorService } from '../../services/doctor.service';
import { DoctorCard } from '../../Models/doctorCard.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit, OnDestroy {
  displayedDoctors: DoctorCard[] = [];
  allDoctors: DoctorCard[] = [];
  showAllDoctors: boolean = false;
  readonly CARDS_PER_PAGE = 6;
  private subscription: Subscription = new Subscription();

  constructor(public doctorService: DoctorService) {}

  ngOnInit(): void {
    // Get initial data
    this.doctorService.getDoctorCard().subscribe();
    console.log(this.doctorService.getDoctorCard().subscribe());
    
    // Subscribe to filtered cards
    this.subscription.add(
      this.doctorService.getFilteredCards().subscribe(doctors => {
        this.allDoctors = [...doctors]; // Keep a copy of all doctors
        console.log(this.allDoctors)
        this.updateDisplayedDoctors();
      })
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updateDisplayedDoctors() {
    const sortedDoctors = [...this.allDoctors].sort((a, b) => {
      if (a.isPinned === b.isPinned) return 0;
      return a.isPinned ? -1 : 1;
    });

    this.displayedDoctors = this.showAllDoctors 
      ? sortedDoctors 
      : sortedDoctors.slice(0, this.CARDS_PER_PAGE);
  }

  toggleShowAll() {
    this.showAllDoctors = !this.showAllDoctors;
    this.updateDisplayedDoctors();
  }

  togglePin(doctorId: number, event: Event) {
    event.stopPropagation();
    this.doctorService.togglePin(doctorId);
  }

  handleCategorySelected(category: string | null) {
    this.showAllDoctors = false;
    this.doctorService.filterBySpecialty(category);
  }

  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }
}