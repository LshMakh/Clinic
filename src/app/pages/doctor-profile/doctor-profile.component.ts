import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrl: './doctor-profile.component.css'
})
export class DoctorProfileComponent{
  doctor = {
    name: 'გიორგი ხიზაძე',
    specialty: 'კარდიოლოგი / არითმოლოგი',
    phone: '01010101010',
    email: 'clinic@gmail.com',
    appointments: 20,
    rating: 5
  };

  

 
}
