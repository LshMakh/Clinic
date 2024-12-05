import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-book-appointment',
  templateUrl: './book-appointment.component.html',
  styleUrl: './book-appointment.component.css'
})
export class BookAppointmentComponent implements OnInit {
  doctorId :number=0;
  isEditVisible : boolean = false;
  isDeleteVisible:boolean = false;

constructor(private route:ActivatedRoute) {
}

ngOnInit() {
  this.route.params.subscribe(params => {
    this.doctorId = Number(params['id']); 
  });
}

toggleEdit(){
  this.isEditVisible = !this.isEditVisible;
}

toggleDelete(){
  this.isDeleteVisible = !this.isDeleteVisible;
}

}
