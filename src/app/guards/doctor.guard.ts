import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class DoctorGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      take(1),
      map((user) => {
        if (user?.role === 'ADMIN' || user?.role === 'DOCTOR') {
          return true;
        }
        this.router.navigate(['/main']);
        return false;
      })
    );
  }
}
