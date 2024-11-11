import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorRoutingModule } from './admin-routing';
import { SharedModule } from '../shared/shared.module';
import { DoctorProfileComponent } from '../../pages/doctor-profile/doctor-profile.component';

@NgModule({
  declarations: [
    DoctorProfileComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DoctorRoutingModule
  ]
})
export class DoctorModule { }