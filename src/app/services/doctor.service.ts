import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { DoctorCard } from '../Models/doctorCard.model';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private readonly PINNED_DOCTORS_KEY = 'pinnedDoctors';
  private _cards: DoctorCard[] = [];
  private filteredCardsSubject = new BehaviorSubject<DoctorCard[]>([]);
  private currentFilter: string | null = null;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.loadPinnedDoctors();
  }

  get cardsList(): DoctorCard[] {
    return this._cards;
  }

  set cardsList(list: DoctorCard[]) {
    const pinnedDoctors = localStorage.getItem(this.PINNED_DOCTORS_KEY);
    const pinnedIds = pinnedDoctors ? new Set(JSON.parse(pinnedDoctors)) : new Set();

    this._cards = list.map(card => ({
      ...card,
      isPinned: pinnedIds.has(card.doctorId)
    }));
    
    this.applyCurrentFilter();
  }

  private applyCurrentFilter() {
    if (this.currentFilter) {
      const filtered = this._cards.filter(
        doctor => doctor.specialty.toLowerCase() === this.currentFilter!.toLowerCase()
      );
      this.filteredCardsSubject.next(filtered);
    } else {
      // When no filter is active, show all cards
      this.filteredCardsSubject.next(this._cards);
    }
  }

  getDoctorCard(): Observable<DoctorCard[]> {
    return this.http.get<DoctorCard[]>('https://localhost:7226/api/Doctor/GetDoctorCards').pipe(
      tap(data => {
        this.cardsList = data;
      })
    );
  }

  getDoctorById(id: number): Observable<DoctorCard> {
    return this.http.get<DoctorCard>(`https://localhost:7226/api/Doctor/GetDoctorById/${id}`);
  }

  deleteDoctorById(id: number): Observable<any> {
    return this.http.delete(`https://localhost:7226/api/Doctor/DeleteDoctorById/${id}`).pipe(
      tap(() => {
        const pinnedDoctors = localStorage.getItem(this.PINNED_DOCTORS_KEY);
        if (pinnedDoctors) {
          const pinnedIds = JSON.parse(pinnedDoctors).filter((pinnedId: number) => pinnedId !== id);
          localStorage.setItem(this.PINNED_DOCTORS_KEY, JSON.stringify(pinnedIds));
        }

        this._cards = this._cards.filter(card => card.doctorId !== id);
        this.applyCurrentFilter();
      })
    );
  }

  private loadPinnedDoctors() {
    const pinnedDoctors = localStorage.getItem(this.PINNED_DOCTORS_KEY);
    if (pinnedDoctors) {
      const pinnedIds = new Set(JSON.parse(pinnedDoctors));
      this._cards = this._cards.map(card => ({
        ...card,
        isPinned: pinnedIds.has(card.doctorId)
      }));
      this.applyCurrentFilter();
    }
  }

  togglePin(doctorId: number) {
    this._cards = this._cards.map(card => {
      if (card.doctorId === doctorId) {
        return { ...card, isPinned: !card.isPinned };
      }
      return card;
    });

    const pinnedIds = this._cards
      .filter(card => card.isPinned)
      .map(card => card.doctorId);
    localStorage.setItem(this.PINNED_DOCTORS_KEY, JSON.stringify(pinnedIds));

    this.applyCurrentFilter();
  }

  getPinnedDoctors(): DoctorCard[] {
    return this._cards.filter(card => card.isPinned);
  }

  getFilteredCards(): Observable<DoctorCard[]> {
    return this.filteredCardsSubject.asObservable();
  }

  filterBySpecialty(specialty: string | null) {
    this.currentFilter = specialty;
    this.applyCurrentFilter();
  }

  clearFilter() {
    this.currentFilter = null;
    this.applyCurrentFilter();
  }
}