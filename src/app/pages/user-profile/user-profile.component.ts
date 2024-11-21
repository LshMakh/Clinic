import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

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



  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isAuthenticated$ = this.authService.isAuthenticated();
    this.currentUser$ = this.authService.getCurrentUser();
    this.userId = Number(this.authService.getUserId());
    
  }
  toggleChangePasswordModal() {
    this.showChangePasswordModal = !this.showChangePasswordModal;
  }
}
