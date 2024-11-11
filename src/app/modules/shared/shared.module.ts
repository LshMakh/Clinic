import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { CategoriesComponent } from '../../components/categories/categories.component';
import { CalendarComponent } from '../../components/calendar/calendar.component';
import { DoctorProfileCardComponent } from '../../components/doctor-profile-card/doctor-profile-card.component';

@NgModule({
  declarations: [
    CategoriesComponent,
    CalendarComponent,
    DoctorProfileCardComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CalendarModule
  ],
  exports: [
    ReactiveFormsModule,
    FormsModule,
    CalendarModule,
    CategoriesComponent,
    CalendarComponent,
    DoctorProfileCardComponent
  ]
})
export class SharedModule { }