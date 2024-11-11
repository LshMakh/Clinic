import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from '../shared/shared.module';
import { AdminCategoriesComponent } from '../../pages/admin-categories/admin-categories.component';
import { AdminProfileComponent } from '../../pages/admin-profile/admin-profile.component';
import { DoctorRegistrationComponent } from '../../pages/doctor-registration/doctor-registration.component';

@NgModule({
  declarations: [
    AdminCategoriesComponent,
    AdminProfileComponent,
    DoctorRegistrationComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }