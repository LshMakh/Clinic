import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated().pipe(
      take(1),
      map((isAuthenticated) => {
        if (isAuthenticated) {
          this.authService
            .getCurrentUser()
            .pipe(take(1))
            .subscribe((user) => {
              switch (user?.role) {
                case 'ADMIN':
                  this.router.navigate(['/admin-prof']);
                  break;
                case 'DOCTOR':
                  this.router.navigate(['/doc-prof']);
                  break;
                case 'PATIENT':
                  this.router.navigate(['/user-prof']);
                  break;
                default:
                  this.router.navigate(['/main']);
              }
            });
          return false;
        }
        return true;
      })
    );
  }
}
