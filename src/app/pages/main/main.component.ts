import { Component, OnInit } from '@angular/core';
import { DoctorService } from '../../services/doctor.service';
import { DoctorCard } from '../../Models/doctorCard.model';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {
  displayedDoctors: DoctorCard[] = [];
  allDoctors: DoctorCard[] = [];
  showAllDoctors: boolean = false;
  readonly CARDS_PER_PAGE = 6;

  constructor(public doctorService: DoctorService) {}

  ngOnInit(): void {
    this.doctorService.getDoctorCard().subscribe(data => {
      this.doctorService.cardsList = data;
      this.allDoctors = [...data];
      this.updateDisplayedDoctors();
      console.log(this.displayedDoctors);
    });
  }

  updateDisplayedDoctors() {
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
    this.allDoctors = this.allDoctors.map(doctor => ({
      ...doctor,
      isPinned: doctor.doctorId === doctorId ? !doctor.isPinned : doctor.isPinned
    }));
    this.updateDisplayedDoctors();
  }

  handleCategorySelected(category: string | null) {
    if (!category) {
      this.allDoctors = [...this.doctorService.cardsList];
    } else {
      this.allDoctors = this.doctorService.cardsList.filter(
        doctor => doctor.specialty.toLowerCase() === category.toLowerCase()
      );
    }
    // Reset to first page when changing categories
    this.showAllDoctors = false;
    this.updateDisplayedDoctors();
  }

  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }
}