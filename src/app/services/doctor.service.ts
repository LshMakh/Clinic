// src/app/services/doctor.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DoctorCard } from '../Models/doctorCard.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private readonly PINNED_DOCTORS_KEY = 'pinnedDoctors';
  private _cards: DoctorCard[] = [];
  private filteredCardsSubject = new BehaviorSubject<DoctorCard[]>([]);
  private currentFilter: string | null = null;

  constructor(private http: HttpClient) {
    this.loadPinnedDoctors();
  }

  // GET requests
  getDoctorCard(): Observable<DoctorCard[]> {
    return this.http.get<DoctorCard[]>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.doctor.base}${API_CONFIG.endpoints.doctor.cards}`
    ).pipe(
      tap(data => {
        this.cardsList = data;
      })
    );
  }

  getDoctorById(id: number): Observable<DoctorCard> {
    return this.http.get<DoctorCard>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.doctor.base}${API_CONFIG.endpoints.doctor.byId}/${id}`
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

  // Local state management
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

  private handleDoctorDeletion(id: number): void {
    const pinnedDoctors = localStorage.getItem(this.PINNED_DOCTORS_KEY);
    if (pinnedDoctors) {
      const pinnedIds = JSON.parse(pinnedDoctors).filter((pinnedId: number) => pinnedId !== id);
      localStorage.setItem(this.PINNED_DOCTORS_KEY, JSON.stringify(pinnedIds));
    }

    this._cards = this._cards.filter(card => card.doctorId !== id);
    this.applyCurrentFilter();
  }

  // Filter and Pin functionality
  private applyCurrentFilter() {
    if (this.currentFilter) {
      const filtered = this._cards.filter(
        doctor => doctor.specialty.toLowerCase() === this.currentFilter!.toLowerCase()
      );
      this.filteredCardsSubject.next(filtered);
    } else {
      this.filteredCardsSubject.next(this._cards);
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

  filterBySpecialty(specialty: string | null) {
    this.currentFilter = specialty;
    this.applyCurrentFilter();
  }

  getFilteredCards(): Observable<DoctorCard[]> {
    return this.filteredCardsSubject.asObservable();
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
}