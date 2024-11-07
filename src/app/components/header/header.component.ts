import { Component, OnInit } from '@angular/core';
import { LoginPopUpComponent } from '../login-pop-up/login-pop-up.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

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

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isAuthenticated$ = this.authService.isAuthenticated();
    this.currentUser$ = this.authService.getCurrentUser();

    
    }
  

  getProfileRoute(role:string):string{
    switch(role){
      case 'ADMIN':
        return '/admin-prof';
      case 'PATIENT':
        return  '/user-prof';
      case 'DOCTOR':
        return '/doc-prof';
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