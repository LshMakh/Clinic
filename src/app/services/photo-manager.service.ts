import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class PhotoManagerService {
  private photoCache: { [key: number]: Observable<SafeUrl> } = {};
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
    if (this.photoCache[doctorId]) {
      return this.photoCache[doctorId];
    }

    const apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.doctor.base}/GetDoctorPhoto/photo/${doctorId}`;
    
    const photo$ = this.http.get(apiUrl, { responseType: 'blob' }).pipe(
      map(blob => {
        const imageUrl = URL.createObjectURL(blob);
        return this.sanitizer.bypassSecurityTrustUrl(imageUrl);
      }),
      catchError(error => {
        console.error(`Error loading photo for doctor ${doctorId}:`, error);
        return of(this.defaultPhotoUrl);
      }),
      shareReplay(1)
    );

    this.photoCache[doctorId] = photo$;
    return photo$;
  }

  clearCache(): void {
    this.photoCache = {};
  }
}