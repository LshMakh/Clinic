import { Component, OnInit } from '@angular/core';
import { LoginPopUpComponent } from '../login-pop-up/login-pop-up.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { finalize, Observable, Subscription } from 'rxjs';
import { DoctorService } from '../../services/doctor.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  isMobileMenuOpen = false;
  showLoginModal = false;
  isAuthenticated$! : Observable<boolean>;
  currentUser$! : Observable<any>;
  private photoSubscriptions = new Map<number, Subscription>();
  doctorPhotos = new Map<number, string>();
  loadingPhotos = new Set<number>();

  constructor(private authService: AuthService, private doctorService:DoctorService) {}

  ngOnInit() {
    this.isAuthenticated$ = this.authService.isAuthenticated();
    this.currentUser$ = this.authService.getCurrentUser();

    
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
  

  getProfileRoute(role:string):string{
    switch(role){
      case 'ADMIN':
        return '/admin/profile';
      case 'PATIENT':
        return  '/patient/profile';
      case 'DOCTOR':
        return '/doctor/profile';
        default:
          return '/user-prof';
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  openLoginModal() {
    this.showLoginModal = true;
  }

  closeLoginModal() {
    this.showLoginModal = false;
  }

  logout() {
    this.authService.logout();
  }
}