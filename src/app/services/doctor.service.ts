import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subscription, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
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
  private photoCache = new Map<number, string>();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authSubscription = this.authService.getCurrentUser().subscribe(()=>{
      if(this._cards.length>0){
        this.cardsList = [...this._cards]; 
      }
    });
    
  }

  getCategoryCount(categoryName:string):Observable<number>{
    return this.http.get<any>(`https://localhost:7226/api/Doctor/GetSpecialtyCount/specialty-count/${categoryName}`)
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

  // getDoctorCard(): Observable<DoctorCard[]> {
  //   return this.http.get<DoctorCard[]>(
  //     `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.doctor.base}${API_CONFIG.endpoints.doctor.cards}`
  //   ).pipe(
  //     map(doctors => this.applyUserPins(doctors)),
  //     tap(data => {
  //       this._cards = data;
  //       this.applyCurrentFilter();
  //     })
  //   );
  // }
   // Add a cache to store doctor photos

  //  updateDoctor(doctorId: number, formData: FormData): Observable<any> {
  //   return this.http.put<any>(
  //     `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.doctor.base}${API_CONFIG.endpoints.doctor.update}/${doctorId}`,
  //     formData
  //   ).pipe(
  //     catchError((error: HttpErrorResponse) => {
  //       if (error.status === 409) {
  //         return throwError(() => new Error('This email is already in use'));
  //       }
  //       if (error.status === 413) {
  //         return throwError(() => new Error('The uploaded files are too large'));
  //       }
  //       return throwError(() => new Error('Failed to update doctor information'));
  //     })
  //   );
  // }

  updateDoctor(doctorId: number, formData: FormData): Observable<any> {
    return this.http.put<any>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.doctor.base}${API_CONFIG.endpoints.doctor.update}/${doctorId}`,
      formData
    ).pipe(
      map(response => {
        return { success: true, message: 'Doctor information updated successfully' };
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 409) {
          return throwError(() => new Error('This email is already in use'));
        }
        if (error.status === 413) {
          return throwError(() => new Error('The uploaded files are too large'));
        }
        const errorMessage = error.error?.message || 'Failed to update doctor information';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  
   extractCvText(doctorId: number): Observable<string> {
    return this.http.post<{ text: string }>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.doctor.base}${API_CONFIG.endpoints.doctor.cv}/${doctorId}`,
      {}
    ).pipe(
      map(response => response.text),
      catchError(error => {
        console.error('Error extracting CV text:', error);
        return throwError(() => new Error('Failed to extract CV text. Please try again later.'));
      })
    );
  }

   
   getDoctorPhoto(id: number): Observable<string> {
     if (this.photoCache.has(id)) {
       return of(this.photoCache.get(id)!);
     }
 
     return this.http.get(
       `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.doctor.base}/GetDoctorPhoto/photo/${id}`, 
       { responseType: 'blob' }
     ).pipe(
       tap(blob => {
         const imageUrl = URL.createObjectURL(blob);
         this.photoCache.set(id, imageUrl);
       }),
       map(blob => {
         return URL.createObjectURL(blob);
       }),
       catchError(error => {
         console.error(`Error loading photo for doctor ${id}:`, error);
         return of('assets/png-clipart-anonymous-person-login-google-account-computer-icons-user-activity-miscellaneous-computer.png');
       })
     );
   }
 
   clearPhotoCache(): void {
     this.photoCache.forEach(url => URL.revokeObjectURL(url));
     this.photoCache.clear();
   }

    getDoctorCard(): Observable<DoctorCard[]> {
      return this.http.get<DoctorCard[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.doctor.base}${API_CONFIG.endpoints.doctor.cards}`)
        .pipe(
          map(doctors => this.applyUserPins(doctors)),
          tap(data => {
            this._cards = data;
            this.applyCurrentFilter();
          }),
          catchError((error: HttpErrorResponse) => {
            console.error('Error fetching doctor cards:', error);
            return throwError(() => new Error('Failed to load doctor cards. Please try again later.'));
          })
        );
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
        }),
          catchError((error: HttpErrorResponse) => {
            console.error('Error fetching doctor by ID:', error);
            return throwError(() => new Error('Failed to load doctor details. Please try again later.'));
          })
        );
    }
  
    deleteDoctorById(id: number): Observable<any> {
      return this.http.delete(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.doctor.base}${API_CONFIG.endpoints.doctor.delete}/${id}`)
        .pipe(
          tap(() => this.handleDoctorDeletion(id)),
          catchError((error: HttpErrorResponse) => {
            console.error('Error deleting doctor:', error);
            return throwError(() => new Error('Failed to delete doctor. Please try again later.'));
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

  // getDoctorById(id: number): Observable<DoctorCard> {
  //   return this.http.get<DoctorCard>(
  //     `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.doctor.base}${API_CONFIG.endpoints.doctor.byId}/${id}`
  //   ).pipe(
  //     map(doctor => {
  //       const currentUserId = this.authService.getUserId();
  //       if (!currentUserId) return doctor;

  //       const userPinnedDoctors = this.getUserPinnedDoctors();
  //       const userPins = new Set(userPinnedDoctors[currentUserId] || []);
        
  //       return {
  //         ...doctor,
  //         isPinned: userPins.has(doctor.doctorId)
  //       };
  //     })
  //   );
  // }

  // deleteDoctorById(id: number): Observable<any> {
  //   return this.http.delete(
  //     `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.doctor.base}${API_CONFIG.endpoints.doctor.delete}/${id}`
  //   ).pipe(
  //     tap(() => {
  //       this.handleDoctorDeletion(id);
  //     })
  //   );
  // }

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