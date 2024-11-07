import { Component, OnInit } from '@angular/core';
import { VisibilityService } from '../../services/visibility.service';
import { DoctorCard } from '../../Models/doctorCard.model';
import { DoctorService } from '../../services/doctor.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.css'
})
export class AdminProfileComponent implements OnInit {
  isVisible: boolean = false;
  doctor:any=null;
  constructor(private visibilityService:VisibilityService, private doctorService:DoctorService, private route:ActivatedRoute,private router:Router){}

  ngOnInit() {
    this.visibilityService.isVisible$.subscribe(visible => {
      this.isVisible = visible;

      if(this.isVisible){
        const id = this.route.snapshot.paramMap.get('id');
        this.doctorService.getDoctorById(Number(id)).subscribe(data=>{
          this.doctor = data;
        });
      }
    });
  }

  toggleVisibility(){
    this.visibilityService.toggleVisibility();    
  }
  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }
 
}
