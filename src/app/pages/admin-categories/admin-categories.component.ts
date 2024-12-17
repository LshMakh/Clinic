import { Component, OnInit } from '@angular/core';
import { DoctorCard } from '../../Models/doctorCard.model';
import { DoctorService } from '../../services/doctor.service';
import { VisibilityService } from '../../services/visibility.service';
import { finalize, Subscription } from 'rxjs';
import { PhotoManagerService } from '../../services/photo-manager.service';

@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.css',
})
export class AdminCategoriesComponent implements OnInit {
  doctors: DoctorCard[] = [];


  constructor(
    public doctorService: DoctorService,
    private visibilityService: VisibilityService,
    private photoManager:PhotoManagerService
  ) {}

  toggleVisibility() {
    this.visibilityService.setVisibility(true);
  }

  ngOnInit() {
  this.loadDoctors();
  }

  private loadDoctors() {
    this.doctorService.getDoctorCard().subscribe(doctors => {
     
      doctors.forEach(doctor => {
        if (!doctor.photoUrl) {
          this.photoManager.getPhoto(doctor.doctorId).subscribe(url => {
            doctor.photoUrl = url;
          });
        }
      });
      this.doctors = doctors;
    });
  }


  deleteDoctor(id: number) {

    if (!confirm('Are you sure you want to delete this doctor?')) {
      return;
    }

    this.doctorService.deleteDoctorById(id).subscribe({
      next: () => {
        this.loadDoctors();
      },
      error: (error) => {
        console.error('Error deleting doctor:', error);
        alert(error.message || 'Failed to delete doctor. Please try again.');
      }
    });
  }

  getStarsArray(rating: number): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => (i < rating ? 1 : 0));
  }
}
