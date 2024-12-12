import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class PhotoManagerService {
  private photoCache: { [key: number]: BehaviorSubject<SafeUrl> } = {};
  private readonly defaultPhotoUrl: SafeUrl;
  
  constructor(
    private http: HttpClient, 
    private sanitizer: DomSanitizer
  ) {
    this.defaultPhotoUrl = this.sanitizer.bypassSecurityTrustUrl(
      'assets/png-clipart-anonymous-person-login-google-account-computer-icons-user-activity-miscellaneous-computer.png'
    );
  }

 
  getPhoto(doctorId: number): Observable<SafeUrl> {
    if (!this.photoCache[doctorId]) {
      this.photoCache[doctorId] = new BehaviorSubject<SafeUrl>(this.defaultPhotoUrl);
      this.loadPhoto(doctorId);
    }
    return this.photoCache[doctorId].asObservable();
  }

  private loadPhoto(doctorId: number) {
    const apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.doctor.base}/GetDoctorPhoto/photo/${doctorId}`;
    
    this.http.get(apiUrl, { responseType: 'blob' }).pipe(
      map(blob => {
        const imageUrl = URL.createObjectURL(blob);
        return this.sanitizer.bypassSecurityTrustUrl(imageUrl);
      }),
      catchError(error => {
        console.error(`Error loading photo for doctor ${doctorId}:`, error);
        return of(this.defaultPhotoUrl);
      })
    ).subscribe(url => {
      this.photoCache[doctorId].next(url);
    });
  }

  refreshPhoto(doctorId: number) {
    if (this.photoCache[doctorId]) {
      this.loadPhoto(doctorId);
    }
  }

  clearCache() {
    Object.values(this.photoCache).forEach(subject => subject.complete());
    this.photoCache = {};
  }
}