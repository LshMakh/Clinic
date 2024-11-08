import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { RegistrationComponent } from './pages/registration/registration.component';
import { AdminCategoriesComponent } from './pages/admin-categories/admin-categories.component';
import { BookAppointmentComponent } from './pages/book-appointment/book-appointment.component';
import { DoctorProfileComponent } from './pages/doctor-profile/doctor-profile.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { DoctorRegistrationComponent } from './pages/doctor-registration/doctor-registration.component';
import { AdminProfileComponent } from './pages/admin-profile/admin-profile.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { DoctorGuard } from './guards/doctor.guard';
import { PatientGuard } from './guards/patient.guard';
import { NoAuthGuard } from './guards/no-auth.guard';

const routes: Routes = [
  {
    path: '',
    component: MainComponent
  },
  {
    path: 'register',
    component: RegistrationComponent,
    canActivate:[NoAuthGuard]
  },
  {
    path: 'doc-reg',
    component: DoctorRegistrationComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin-prof',
    component: AdminProfileComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin-prof/:id',
    component: AdminProfileComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin-cat',
    component: AdminCategoriesComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'doc-prof',
    component: DoctorProfileComponent,
    canActivate: [DoctorGuard]
  },
  {
    path: 'user-prof',
    component: UserProfileComponent,
    canActivate: [PatientGuard]
  },
  {
    path: 'book-appointment/:id',
    component: BookAppointmentComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'main',
    component: MainComponent
  },
  {
    path: '**',
    redirectTo: 'main'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }