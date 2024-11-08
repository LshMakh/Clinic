import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisibilityService {
  private visibilitySource = new BehaviorSubject<boolean>(false);
  private editVisibilitySource = new BehaviorSubject<boolean>(false);
  
  isVisible$ = this.visibilitySource.asObservable();
  isEditVisible$ = this.editVisibilitySource.asObservable();

  toggleVisibility() {
    this.visibilitySource.next(!this.visibilitySource.value);
  }

  setVisibility(value: boolean) {
    this.visibilitySource.next(value);
  }

  toggleEditVisibility() {
    this.editVisibilitySource.next(!this.editVisibilitySource.value);
  }
}