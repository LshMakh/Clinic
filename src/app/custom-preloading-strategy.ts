import { Injectable } from '@angular/core';
import { PreloadAllModules, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CustomPreloadingStrategy implements PreloadAllModules {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Preload only routes that have preload data property set to true
    if (route.data?.['preload'] === true) {
      console.log('Preloading:', route.path);
      return load();
    }
    return of(null);
  }
}