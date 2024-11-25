import { Component, OnInit } from '@angular/core';
import { DoctorCard } from '../../Models/doctorCard.model';
import { DoctorService } from '../../services/doctor.service';
import { VisibilityService } from '../../services/visibility.service';
import { finalize, Subscription } from 'rxjs';


@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.css'
  
})

export class AdminCategoriesComponent implements OnInit {
 doctors:DoctorCard[]=[];
 private photoSubscriptions = new Map<number, Subscription>();
 doctorPhotos = new Map<number, string>();
 loadingPhotos = new Set<number>();

 constructor(public doctorService:DoctorService,private visibilityService:VisibilityService){}

 toggleVisibility(){

  this.visibilityService.setVisibility(true);
 }

  ngOnInit() {

    this.doctorService.getDoctorCard().subscribe(data=>{
      this.doctorService.cardsList = data;
      this.doctors = data;
    }) 
  }
  loadDoctorPhoto(doctorId: number): void {
    if (this.photoSubscriptions.has(doctorId)) {
      return; // Already loading or loaded
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
          // Set default image on error
          this.doctorPhotos.set(doctorId, '/assets/default-doctor.png');
        }
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

  deleteDoctor(id:number){
    this.doctorService.deleteDoctorById(id).subscribe(res=>{
      this.doctorService.getDoctorCard().subscribe(data=>{
        this.doctorService.cardsList = data;
        this.doctors = data;
    });
  });
}

  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

}
