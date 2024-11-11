import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationRoutingModule } from './registration-routing.modue';
import { SharedModule } from '../shared/shared.module';
import { RegistrationComponent } from '../../pages/registration/registration.component';

@NgModule({
  declarations: [
    RegistrationComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RegistrationRoutingModule
  ]
})
export class RegistrationModule { }