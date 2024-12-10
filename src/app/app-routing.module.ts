import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';
import { CustomPreloadingStrategy } from './custom-preloading-strategy';
import { BookAppointmentComponent } from './pages/book-appointment/book-appointment.component';
import { NoDoctorGuard } from './guards/no-doctor-guard';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
  },
  {
    path: 'main',
    component: MainComponent,
  },
  {
    path: 'book-appointment/:id',
    component: BookAppointmentComponent,
    canActivate: [NoDoctorGuard],
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./modules/registration/registration.module')
        .then((m) => m.RegistrationModule)
        .catch((err) => {
          console.error('Error loading registration module:', err);
          throw err;
        }),
    canActivate: [NoAuthGuard],
    data: { preload: true },
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./modules/admin/admin.module')
        .then((m) => m.AdminModule)
        .catch((err) => {
          console.error('Error loading admin module:', err);
          throw err;
        }),
    canActivate: [AuthGuard],
    data: { preload: false },
  },
  {
    path: 'doctor',
    loadChildren: () =>
      import('./modules/doctor/doctor.module')
        .then((m) => m.DoctorModule)
        .catch((err) => {
          console.error('Error loading doctor module:', err);
          throw err;
        }),
    canActivate: [AuthGuard],
    data: { preload: true },
  },
  {
    path: 'patient',
    loadChildren: () =>
      import('./modules/patient/patient.module')
        .then((m) => m.PatientModule)
        .catch((err) => {
          console.error('Error loading patient module:', err);
          throw err;
        }),
    canActivate: [AuthGuard],
    data: { preload: true },
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: CustomPreloadingStrategy,
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
