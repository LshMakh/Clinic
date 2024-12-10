import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientGuard } from '../../guards/patient.guard';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { BookAppointmentComponent } from '../../pages/book-appointment/book-appointment.component';

const routes: Routes = [
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [PatientGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PatientRoutingModule {}
