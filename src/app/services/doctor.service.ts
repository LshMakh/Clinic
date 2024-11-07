import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { DoctorCard } from '../Models/doctorCard.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { JsonPipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  cards : DoctorCard[]=[];
  private filteredCardsSubject = new BehaviorSubject<DoctorCard[]>([]);
  private originalCards: DoctorCard[] = [];
  private readonly PINNED_DOCTORS_KEY = 'pinnedDoctors';

  constructor(private http:HttpClient, private authService:AuthService) {

   }

  getDoctorCard():Observable<DoctorCard[]>{
    return this.http.get<DoctorCard[]>('https://localhost:7226/api/Doctor/GetDoctorCards');
  }
  getDoctorById(id: number): Observable<DoctorCard> {
    return this.http.get<DoctorCard>(`https://localhost:7226/api/Doctor/GetDoctorById/${id}`);
  }
  deleteDoctorById(id:number):Observable<any>{
    return this.http.delete(`https://localhost:7226/api/Doctor/DeleteDoctorById/${id}`);
  }

  get cardsList():DoctorCard[]{
  
    return this.cards;
  }

  set cardsList(list:DoctorCard[]){
    const pinnedDoctors = localStorage.getItem(this.PINNED_DOCTORS_KEY);
    const pinnedIds = pinnedDoctors ? new Set(JSON.parse(pinnedDoctors)): new Set();


      this.cards = list.map(card=>({
        ...card,
        isPinned:pinnedIds.has(card.doctorId)
      }));
      this.originalCards=[...this.cards];
      this.filteredCardsSubject.next(this.cards);
  }
  private loadPinnedDoctors(){
    const pinnedDoctors = localStorage.getItem(this.PINNED_DOCTORS_KEY);
    if(pinnedDoctors){
      const pinnedIds = new Set(JSON.parse(pinnedDoctors));
      this.cards = this.cards.map(card=>({
        ...card,
        isPinned:pinnedIds.has(card.doctorId)
      }));
    }
  }

  private savePinnedDoctors(){
    const pinnedIds = this.cards.filter(card=>card.isPinned)
    .map(card=>card.doctorId);
    localStorage.setItem(this.PINNED_DOCTORS_KEY,JSON.stringify(pinnedIds));
  }

  togglePin(doctorId:number){
    this.cards=this.cards.map(card=>{
      if(card.doctorId===doctorId){
        return  {...card,isPinned:!card.isPinned};
      }
      return card;
    });
    this.originalCards =[...this.cards];
    this.filteredCardsSubject.next(this.cards);
    this.savePinnedDoctors();
  }

  getPinnedDoctors(){
    return this.cards.filter(card=>card.isPinned);
  }

  getFilteredCards():Observable<DoctorCard[]>{
    return this.filteredCardsSubject.asObservable();
  }
  filterBySpecialty(specialty:string|null){
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
