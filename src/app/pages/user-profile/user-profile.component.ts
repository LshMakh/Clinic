import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {

  isAuthenticated$! : Observable<boolean>;
  userId :number|null = null;
  currentUser$! : Observable<any>;
  showChangePasswordModal = false;
  doctorId :number = 0;
  appointmentCount:number = 0;



  constructor(private authService: AuthService, private appointmentService:AppointmentService) {}

  ngOnInit() {
    this.isAuthenticated$ = this.authService.isAuthenticated();
    this.currentUser$ = this.authService.getCurrentUser();
    this.userId = Number(this.authService.getUserId());
    this.doctorId = Number(this.authService.getUserId());
    this.toggleAppointmentCount();
    
  }
  toggleChangePasswordModal() {
    this.showChangePasswordModal = !this.showChangePasswordModal;
  }

  toggleAppointmentCount(){
    this.appointmentService.getCurrentUserAppointmentCount().subscribe({
      next:(count)=>{
        this.appointmentCount = count;
      }
    });
  }
}
