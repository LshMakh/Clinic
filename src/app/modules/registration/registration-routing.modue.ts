import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistrationComponent } from '../../pages/registration/registration.component';
import { NoAuthGuard } from '../../guards/no-auth.guard';

const routes: Routes = [
  {
    path: '',
    component: RegistrationComponent,
    canActivate: [NoAuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegistrationRoutingModule { }