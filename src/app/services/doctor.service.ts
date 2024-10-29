import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { DoctorCard } from '../Models/doctorCard.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  constructor(private http:HttpClient, private authService:AuthService) { }
  cards : DoctorCard[]=[];

  getDoctorCard():Observable<DoctorCard[]>{
    return this.http.get<DoctorCard[]>('https://localhost:7226/api/Doctor/GetDoctorCards');
  }

  get cardsList():DoctorCard[]{
  
    return this.cards;
  }

  set cardsList(list:DoctorCard[]){
      this.cards = list;
  }
}
