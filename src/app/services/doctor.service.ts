import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { DoctorCard } from '../Models/doctorCard.model';
import { API_CONFIG } from '../config/api.config';
import { AuthService } from './auth.service';

interface UserPinnedDoctors {
  [userId: string]: number[];
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private readonly PINNED_DOCTORS_KEY = 'userPinnedDoctors';
  private _cards: DoctorCard[] = [];
  private filteredCardsSubject = new BehaviorSubject<DoctorCard[]>([]);
  private currentFilter: string | null = null;
  private authSubscription:Subscription;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authSubscription = this.authService.getCurrentUser().subscribe(()=>{
      //reload cards with new users pins when auth state changes
      if(this._cards.length>0){
        this.cardsList = [...this._cards]; //refresh pins
      }
    });
    
  }

  ngOnDestroy(){
    if(this.authSubscription){
      this.authSubscription.unsubscribe();
    }
  }

  // Getter and setter for cardsList
  get cardsList(): DoctorCard[] {
    return this._cards;
  }

  set cardsList(list: DoctorCard[]) {
    this._cards = this.applyUserPins(list);
    this.applyCurrentFilter();
  }

  getDoctorCard(): Observable<DoctorCard[]> {
    return this.http.get<DoctorCard[]>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.doctor.base}${API_CONFIG.endpoints.doctor.cards}`
    ).pipe(
      map(doctors => this.applyUserPins(doctors)),
      tap(data => {
        this._cards = data;
        this.applyCurrentFilter();
      })
    );
  }

  private applyUserPins(doctors: DoctorCard[]): DoctorCard[] {
    const currentUserId = this.authService.getUserId();
    if (!currentUserId) return doctors;

    const userPinnedDoctors = this.getUserPinnedDoctors();
    const userPins = new Set(userPinnedDoctors[currentUserId] || []);

    return doctors.map(doctor => ({
      ...doctor,
      isPinned: userPins.has(doctor.doctorId)
    }));
  }

  getDoctorById(id: number): Observable<DoctorCard> {
    return this.http.get<DoctorCard>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.doctor.base}${API_CONFIG.endpoints.doctor.byId}/${id}`
    ).pipe(
      map(doctor => {
        const currentUserId = this.authService.getUserId();
        if (!currentUserId) return doctor;

        const userPinnedDoctors = this.getUserPinnedDoctors();
        const userPins = new Set(userPinnedDoctors[currentUserId] || []);
        
        return {
          ...doctor,
          isPinned: userPins.has(doctor.doctorId)
        };
      })
    );
  }

  deleteDoctorById(id: number): Observable<any> {
    return this.http.delete(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.doctor.base}${API_CONFIG.endpoints.doctor.delete}/${id}`
    ).pipe(
      tap(() => {
        this.handleDoctorDeletion(id);
      })
    );
  }

  private handleDoctorDeletion(id: number): void {
    const currentUserId = this.authService.getUserId();
    if (currentUserId) {
      const userPinnedDoctors = this.getUserPinnedDoctors();
      if (userPinnedDoctors[currentUserId]) {
        userPinnedDoctors[currentUserId] = userPinnedDoctors[currentUserId].filter(
          pinnedId => pinnedId !== id
        );
        localStorage.setItem(this.PINNED_DOCTORS_KEY, JSON.stringify(userPinnedDoctors));
      }
    }

    this._cards = this._cards.filter(card => card.doctorId !== id);
    this.applyCurrentFilter();
  }

  togglePin(doctorId: number): void {
    const currentUserId = this.authService.getUserId();
    if (!currentUserId) return;

    const userPinnedDoctors = this.getUserPinnedDoctors();
    const userPins = userPinnedDoctors[currentUserId] || [];
    
    if (userPins.includes(doctorId)) {
      userPinnedDoctors[currentUserId] = userPins.filter(id => id !== doctorId);
    } else {
      userPinnedDoctors[currentUserId] = [...userPins, doctorId];
    }

    localStorage.setItem(this.PINNED_DOCTORS_KEY, JSON.stringify(userPinnedDoctors));

    this._cards = this._cards.map(card => {
      if (card.doctorId === doctorId) {
        return { ...card, isPinned: !card.isPinned };
      }
      return card;
    });

    this.applyCurrentFilter();
  }

  private applyCurrentFilter(): void {
    const currentUserId = this.authService.getUserId();
    let cardsToFilter = this._cards;

    if (currentUserId) {
      const userPinnedDoctors = this.getUserPinnedDoctors();
      const userPins = new Set(userPinnedDoctors[currentUserId] || []);
      
      cardsToFilter = this._cards.map(card => ({
        ...card,
        isPinned: userPins.has(card.doctorId)
      }));
    }

    const filteredCards = this.currentFilter
      ? cardsToFilter.filter(doctor => 
          doctor.specialty.toLowerCase() === this.currentFilter!.toLowerCase())
      : cardsToFilter;

    const sortedCards = [...filteredCards].sort((a, b) => {
      if (a.isPinned === b.isPinned) return 0;
      return a.isPinned ? -1 : 1;
    });

    this.filteredCardsSubject.next(sortedCards);
  }

  filterBySpecialty(specialty: string | null): void {
    this.currentFilter = specialty;
    this.applyCurrentFilter();
  }

  getFilteredCards(): Observable<DoctorCard[]> {
    return this.filteredCardsSubject.asObservable();
  }

  private getUserPinnedDoctors(): UserPinnedDoctors {
    const pinnedDoctors = localStorage.getItem(this.PINNED_DOCTORS_KEY);
    return pinnedDoctors ? JSON.parse(pinnedDoctors) : {};
  }
}