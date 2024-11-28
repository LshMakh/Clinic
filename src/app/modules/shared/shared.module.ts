import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { CategoriesComponent } from '../../components/categories/categories.component';
import { CalendarComponent } from '../../components/calendar/calendar.component';
import { DoctorProfileCardComponent } from '../../components/doctor-profile-card/doctor-profile-card.component';
import { SearchDropdownComponent } from '../../components/search-dropdown/search-dropdown.component';
import { ChangePasswordModalComponent } from '../../components/change-password-modal/change-password-modal.component';
import { BookingModalComponent } from '../../components/booking-modal/booking-modal.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    CategoriesComponent,
    BookingModalComponent,
    CalendarComponent,
    SearchDropdownComponent,
    DoctorProfileCardComponent,
    ChangePasswordModalComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CalendarModule,
    RouterModule
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CalendarModule,
    RouterModule,
    CategoriesComponent,
    SearchDropdownComponent,
    CalendarComponent,
    DoctorProfileCardComponent,
    ChangePasswordModalComponent,
    BookingModalComponent
  ]
})
export class SharedModule { }