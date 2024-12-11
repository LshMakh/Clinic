import { Component, OnInit } from '@angular/core';
import { count, finalize, Observable, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { DoctorService } from '../../services/doctor.service';
import { ChangePasswordModalComponent } from '../../components/change-password-modal/change-password-modal.component';
import { AppointmentService } from '../../services/appointment.service';
import { SafeUrl } from '@angular/platform-browser';
import { PhotoManagerService } from '../../services/photo-manager.service';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrl: './doctor-profile.component.css',
})
export class DoctorProfileComponent implements OnInit {
  isAuthenticated$!: Observable<boolean>;
  currentUser$!: Observable<any>;
  showChangePasswordModal = false;
  userId: number = 0;
  appointmentCount: number = 0;
  isDeleteVisible: boolean = false;
  appointmentCount$!: Observable<number>;
  isEditVisible: boolean = false;
  photoUrl: SafeUrl | undefined;


  constructor(
    private authService: AuthService,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private photoManager:PhotoManagerService
  ) {}

  ngOnInit() {
    this.isAuthenticated$ = this.authService.isAuthenticated();
    this.currentUser$ = this.authService.getCurrentUser();
    this.userId = Number(this.authService.getUserId());
    this.appointmentCount$ = this.appointmentService.appointmentCount$;
    this.appointmentService.getCurrentUserAppointmentCount().subscribe();

    this.currentUser$.subscribe(user=>{
      if(user?.doctorId){
        this.loadDoctorPhoto(user.doctorId)
      }
    });
  }

  toggleChangePasswordModal() {
    this.showChangePasswordModal = !this.showChangePasswordModal;
  }

  toggleDelete() {
    this.isDeleteVisible = !this.isDeleteVisible;
  }
  toggleEdit() {
    this.isEditVisible = !this.isEditVisible;
  }

  
  private loadDoctorPhoto(doctorId: number) {
    this.photoManager.getPhoto(doctorId).subscribe({
      next: (url) => {
        this.photoUrl = url;
      },
      error: (error) => {
        console.error('Error loading doctor photo:', error);
      }
    });
  }

  getStarsArray(rating: number): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => (i < rating ? 1 : 0));
  }
}
