import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientRoutingModule } from './patient-routing';
import { SharedModule } from '../shared/shared.module';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { BookAppointmentComponent } from '../../pages/book-appointment/book-appointment.component';

@NgModule({
  declarations: [
    UserProfileComponent,
    BookAppointmentComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PatientRoutingModule
  ]
})
export class PatientModule { }