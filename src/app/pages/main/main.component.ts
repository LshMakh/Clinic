import { Component, OnInit } from '@angular/core';
import { DoctorService } from '../../services/doctor.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit{

  constructor(public doctorService:DoctorService){}

  ngOnInit(): void {

    this.doctorService.getDoctorCard().subscribe(data=>{
      this.doctorService.cardsList=data;
    })
      
  }


}
