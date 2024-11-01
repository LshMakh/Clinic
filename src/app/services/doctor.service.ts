import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { DoctorCard } from '../Models/doctorCard.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  cards : DoctorCard[]=[];
  private filteredCardsSubject = new BehaviorSubject<DoctorCard[]>([]);
  private originalCards: DoctorCard[] = [];

  constructor(private http:HttpClient, private authService:AuthService) { }

  getDoctorCard():Observable<DoctorCard[]>{
    return this.http.get<DoctorCard[]>('https://localhost:7226/api/Doctor/GetDoctorCards');
  }

  get cardsList():DoctorCard[]{
  
    return this.cards;
  }

  set cardsList(list:DoctorCard[]){
      this.cards = list;
      this.originalCards=[...list];
      this.filteredCardsSubject.next(list);
  }

  getFilteredCards():Observable<DoctorCard[]>{
    return this.filteredCardsSubject.asObservable();
  }
  filterBySpecialty(specialty:string){
    if(!specialty){
      this.filteredCardsSubject.next(this.originalCards);
      return;
    }
    const filtered = this.originalCards.filter(
      doctor=>doctor.specialty.toLowerCase() === specialty.toLowerCase()
    );
    this.filteredCardsSubject.next(filtered);
  }
}
