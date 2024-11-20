import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrl: './doctor-profile.component.css'
})
export class DoctorProfileComponent implements OnInit{
 
  isAuthenticated$! : Observable<boolean>;
  currentUser$! : Observable<any>;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isAuthenticated$ = this.authService.isAuthenticated();
    this.currentUser$ = this.authService.getCurrentUser();
  }

  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  

 
}
