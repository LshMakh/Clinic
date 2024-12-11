import { Component, OnInit } from '@angular/core';
import { LoginPopUpComponent } from '../login-pop-up/login-pop-up.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { finalize, Observable, Subscription } from 'rxjs';
import { DoctorService } from '../../services/doctor.service';
import { PhotoManagerService } from '../../services/photo-manager.service';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  isMobileMenuOpen = false;
  showLoginModal = false;
  isAuthenticated$!: Observable<boolean>;
  currentUser$!: Observable<any>;
  photoUrl: SafeUrl | undefined;


  constructor(
    private authService: AuthService,
    private doctorService: DoctorService,
    private photoManager:PhotoManagerService
  ) {}

  ngOnInit() {
    this.isAuthenticated$ = this.authService.isAuthenticated();
    this.currentUser$ = this.authService.getCurrentUser();

    this.currentUser$.subscribe(user=>{
      if(user?.doctorId){
        this.loadDoctorPhoto(user.doctorId)
      }
    });

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

  getProfileRoute(role: string): string {
    switch (role) {
      case 'ADMIN':
        return '/admin/profile';
      case 'PATIENT':
        return '/patient/profile';
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
