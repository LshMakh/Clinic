import { Component, OnInit } from '@angular/core';
import { DoctorCard } from '../../Models/doctorCard.model';
import { DoctorService } from '../../services/doctor.service';
import { VisibilityService } from '../../services/visibility.service';


@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.css'
  
})

export class AdminCategoriesComponent implements OnInit {
 doctors:DoctorCard[]=[];

 constructor(public doctorService:DoctorService,private visibilityService:VisibilityService){}

 toggleVisibility(){

  this.visibilityService.setVisibility(true);
 }

  ngOnInit() {

    this.doctorService.getDoctorCard().subscribe(data=>{
      this.doctorService.cardsList = data;
      this.doctors = data;
    }) 
  }

  deleteDoctor(id:number){
    this.doctorService.deleteDoctorById(id).subscribe(res=>{
      this.doctorService.getDoctorCard().subscribe(data=>{
        this.doctorService.cardsList = data;
        this.doctors = data;
    });
  });
}

  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

}
