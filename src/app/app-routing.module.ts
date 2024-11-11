import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';
import { CustomPreloadingStrategy } from './custom-preloading-strategy';

const routes: Routes = [
  {
    path: '',
    component: MainComponent
  },
  {
    path:'main',
    component:MainComponent
  },
  {
    path: 'register',
    loadChildren: () => import('./modules/registration/registration.module')
      .then(m => m.RegistrationModule)
      .catch(err => {
        console.error('Error loading registration module:', err);
        throw err;
      }),
    canActivate: [NoAuthGuard],
    data: { preload: true } // This module will be preloaded
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.module')
      .then(m => m.AdminModule)
      .catch(err => {
        console.error('Error loading admin module:', err);
        throw err;
      }),
    canActivate: [AuthGuard],
    data: { preload: false } // This module will not be preloaded
  },
  {
    path: 'doctor',
    loadChildren: () => import('./modules/doctor/doctor.module')
      .then(m => m.DoctorModule)
      .catch(err => {
        console.error('Error loading doctor module:', err);
        throw err;
      }),
    canActivate: [AuthGuard],
    data: { preload: true }
  },
  {
    path: 'patient',
    loadChildren: () => import('./modules/patient/patient.module')
      .then(m => m.PatientModule)
      .catch(err => {
        console.error('Error loading patient module:', err);
        throw err;
      }),
    canActivate: [AuthGuard],
    data: { preload: true }
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      
      preloadingStrategy: CustomPreloadingStrategy,
      
     
      scrollPositionRestoration: 'enabled', // Restore scroll position when navigating
      anchorScrolling: 'enabled', // Enable anchor scrolling
      onSameUrlNavigation: 'reload' // Reload the same URL when navigating
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }