import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from '../../guards/admin.guard';
import { AdminCategoriesComponent } from '../../pages/admin-categories/admin-categories.component';
import { AdminProfileComponent } from '../../pages/admin-profile/admin-profile.component';
import { DoctorRegistrationComponent } from '../../pages/doctor-registration/doctor-registration.component';

const routes: Routes = [
  {
    path: 'categories',
    component: AdminCategoriesComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'profile',
    component: AdminProfileComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'profile/:id',
    component: AdminProfileComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'doctor-registration',
    component: DoctorRegistrationComponent,
    canActivate: [AdminGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
