import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisibilityService {
  private visibilitySource = new BehaviorSubject<boolean>(false);
  private editVisibilitySource = new BehaviorSubject<boolean>(false);
  
  isVisible$ = this.visibilitySource.asObservable();
  isEditVisible$ = this.editVisibilitySource.asObservable();

  constructor(private router: Router) {
    // Reset visibility when navigating to routes without doctor ID
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (!event.url.includes('/admin/profile/')) {
        this.setVisibility(false);
        this.editVisibilitySource.next(false);
      }
    });
  }

  toggleVisibility() {
    this.visibilitySource.next(!this.visibilitySource.value);
  }

  setVisibility(value: boolean) {
    this.visibilitySource.next(value);
    if (!value) {
      this.editVisibilitySource.next(false);
    }
  }

  toggleEditVisibility() {
    this.editVisibilitySource.next(!this.editVisibilitySource.value);
  }
}