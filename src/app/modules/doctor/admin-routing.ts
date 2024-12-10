import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoctorGuard } from '../../guards/doctor.guard';
import { DoctorProfileComponent } from '../../pages/doctor-profile/doctor-profile.component';

const routes: Routes = [
  {
    path: 'profile',
    component: DoctorProfileComponent,
    canActivate: [DoctorGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DoctorRoutingModule {}
