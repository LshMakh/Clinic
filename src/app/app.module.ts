import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { RegistrationComponent } from './pages/registration/registration.component';
import { MainComponent } from './pages/main/main.component';
import { LoginPopUpComponent } from './components/login-pop-up/login-pop-up.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AdminCategoriesComponent } from './pages/admin-categories/admin-categories.component';
import { BookAppointmentComponent } from './pages/book-appointment/book-appointment.component';
import { DoctorProfileCardComponent } from './components/doctor-profile-card/doctor-profile-card.component';
import { Calendar, CalendarModule } from 'primeng/calendar';
import { CategoriesComponent } from './components/categories/categories.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { DoctorProfileComponent } from './pages/doctor-profile/doctor-profile.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { AdminProfileComponent } from './pages/admin-profile/admin-profile.component';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { DoctorRegistrationComponent } from './pages/doctor-registration/doctor-registration.component';

 


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    RegistrationComponent,
    FooterComponent,
    MainComponent,
    LoginPopUpComponent,
    AdminCategoriesComponent,
    BookAppointmentComponent,
    DoctorProfileCardComponent,
    CategoriesComponent,
    UserProfileComponent,
    DoctorProfileComponent,
    CalendarComponent,
    AdminProfileComponent,
    DoctorRegistrationComponent,
    
    
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MatDialogModule,
    HttpClientModule,
    CalendarModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [
    provideHttpClient(withFetch(), withInterceptorsFromDi())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
