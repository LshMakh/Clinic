import { Component, OnInit } from '@angular/core';
import { count, finalize, Observable, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { DoctorService } from '../../services/doctor.service';
import { ChangePasswordModalComponent } from '../../components/change-password-modal/change-password-modal.component';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrl: './doctor-profile.component.css'
})
export class DoctorProfileComponent implements OnInit{
 
  isAuthenticated$! : Observable<boolean>;
  currentUser$! : Observable<any>;
  private photoSubscriptions = new Map<number, Subscription>();
  doctorPhotos = new Map<number, string>();
  loadingPhotos = new Set<number>();
  showChangePasswordModal = false;
  userId: number= 0;
  appointmentCount:number = 0;
  isDeleteVisible :boolean = false;
  appointmentCount$!:Observable<number>;
  isEditVisible : boolean = false;


  constructor(private authService: AuthService, private doctorService:DoctorService, private appointmentService:AppointmentService) {}

  ngOnInit() {
    this.isAuthenticated$ = this.authService.isAuthenticated();
    this.currentUser$ = this.authService.getCurrentUser();
    this.userId = Number(this.authService.getUserId());
    this.appointmentCount$ = this.appointmentService.appointmentCount$;
    this.appointmentService.getCurrentUserAppointmentCount().subscribe();

  }

  toggleChangePasswordModal(){
    this.showChangePasswordModal = !this.showChangePasswordModal;
  }

  


  toggleDelete(){
    this.isDeleteVisible = !this.isDeleteVisible;
  }
  toggleEdit(){
    this.isEditVisible = !this.isEditVisible;
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
      return 'assets/png-clipart-anonymous-person-login-google-account-computer-icons-user-activity-miscellaneous-computer.png'; // Show placeholder while loading
    }
    return this.doctorPhotos.get(doctorId) || '/assets/default-doctor.png';
  }

  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  

 
}
