// visibility.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisibilityService {
  private visibilitySource = new BehaviorSubject<boolean>(false);
  isVisible$ = this.visibilitySource.asObservable();

  // constructor(){
  //   this.visibilitySource.next(true);
  // }

  toggleVisibility() {
    if(!this.visibilitySource.value){
    this.visibilitySource.next(!this.visibilitySource.value);
    }else{
      this.visibilitySource.next(false);
      this.visibilitySource.next(true);
    }
  }
}
