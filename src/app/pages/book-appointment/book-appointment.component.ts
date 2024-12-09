import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-book-appointment',
  templateUrl: './book-appointment.component.html',
  styleUrl: './book-appointment.component.css'
})
export class BookAppointmentComponent implements OnInit {
  doctorId :number=0;
  isEditVisible : boolean = false;
  isDeleteVisible:boolean = false;
  isAuthenticated$! : Observable<boolean>;


constructor(private route:ActivatedRoute, private authService:AuthService) {
}

ngOnInit() {
  this.route.params.subscribe(params => {
    this.doctorId = Number(params['id']); 
  });
  this.isAuthenticated$ = this.authService.isAuthenticated();

}

toggleEdit(){
  this.isEditVisible = !this.isEditVisible;
}

toggleDelete(){
  this.isDeleteVisible = !this.isDeleteVisible;
}

}
