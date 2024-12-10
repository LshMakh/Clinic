import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientRoutingModule } from './patient-routing';
import { SharedModule } from '../shared/shared.module';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { BookAppointmentComponent } from '../../pages/book-appointment/book-appointment.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [UserProfileComponent],
  imports: [
    CommonModule,
    SharedModule,
    PatientRoutingModule,
    ReactiveFormsModule,
  ],
})
export class PatientModule {}
