import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.css'
})
export class AdminProfileComponent {
  showDoctorsGrid = false;
  showCategoriesGrid = false;
  showRegistration = false;
  activeButton: number = 0;
  

  showGrid(gridNumber: number, buttonIndex: number): void {
    this.activeButton = buttonIndex;
    this.showRegistration = gridNumber === 1;
    this.showCategoriesGrid = gridNumber === 2;
    this.showDoctorsGrid = gridNumber === 3;
  }
}
