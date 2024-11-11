import { Component, OnInit } from '@angular/core';
import { Router, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <app-header></app-header>
    <main class="content">
      <!-- Loading indicator for lazy loaded modules -->
      <div *ngIf="isLoading" class="loading-indicator">
        Loading...
      </div>
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
  styles: [`
    .loading-indicator {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #18a4e1;
      height: 3px;
      z-index: 1000;
      animation: loading 1s ease-in-out infinite;
    }
    @keyframes loading {
      0% { width: 0; }
      50% { width: 50%; }
      100% { width: 100%; }
    }
  `]
})
export class AppComponent implements OnInit {
  isLoading = false;
  loadingCount = 0;

  constructor(private router: Router) {}

  ngOnInit() {
    // Track loading state of lazyloaded modules
    this.router.events.subscribe(event => {
      if (event instanceof RouteConfigLoadStart) {
        this.loadingCount++;
        this.isLoading = true;
      } else if (event instanceof RouteConfigLoadEnd) {
        this.loadingCount--;
        this.isLoading = this.loadingCount > 0;
      }
    });
  }
}