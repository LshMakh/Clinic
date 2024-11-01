import { Component, OnInit } from '@angular/core';
import { DoctorService } from '../../services/doctor.service';
import { DoctorCard } from '../../Models/doctorCard.model';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit{
  displayedDoctors:DoctorCard[]=[];
  constructor(public doctorService:DoctorService){}

  ngOnInit(): void {
    this.doctorService.getDoctorCard().subscribe(data => {
      this.doctorService.cardsList = data;
      this.displayedDoctors = data;
      console.log(this.displayedDoctors)
    });
  }


  handleCategorySelected(category: string|null) {
    console.log('Category selected in main:', category);
    if (!category) {
      // Reset to show all doctors
      this.displayedDoctors = this.doctorService.cardsList;
    } else {
      // Filter doctors by category
      this.displayedDoctors = this.doctorService.cardsList.filter(
        doctor => doctor.specialty.toLowerCase() === category.toLowerCase()
      );
    }
  }


}
