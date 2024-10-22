import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { RegistrationComponent } from './pages/registration/registration.component';
import { AdminCategoriesComponent } from './pages/admin-categories/admin-categories.component';
import { BookAppointmentComponent } from './pages/book-appointment/book-appointment.component';
import { DoctorProfileCardComponent } from './components/doctor-profile-card/doctor-profile-card.component';
import { DoctorProfileComponent } from './pages/doctor-profile/doctor-profile.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { DoctorRegistrationComponent } from './pages/doctor-registration/doctor-registration.component';
import { AdminProfileComponent } from './pages/admin-profile/admin-profile.component';

const routes: Routes = [{
  path:'',
  component:DoctorProfileComponent,
},{
  path:'doc-reg',
  component:DoctorRegistrationComponent
},
{
  path:'admin-prof',
  component:AdminProfileComponent
},
{
  path:'register',
  component:RegistrationComponent,
},
{
  path:'admin-cat',
  component:AdminCategoriesComponent,
},
{
  path:'doc-prof',
  component:DoctorProfileComponent,
},
{
  path:'user-prof',
  component:UserProfileComponent,

},
{
  path:'book-appointment',
  component:BookAppointmentComponent,

},
{
  path:'main',
  component:MainComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
