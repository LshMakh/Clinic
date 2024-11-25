
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { DoctorService } from '../../services/doctor.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-doctor-profile-card',
  templateUrl: './doctor-profile-card.component.html',
  styleUrls: ['./doctor-profile-card.component.css']
})
export class DoctorProfileCardComponent implements OnInit, OnDestroy {
  @Input() doctorId: number = 0;
  private routeSub: Subscription | null = null;
  private photoSubscription: Subscription | null = null;

  doctor: any = null;
  photoUrl: string = 'assets/png-clipart-anonymous-person-login-google-account-computer-icons-user-activity-miscellaneous-computer.png';
  isLoadingPhoto: boolean = false;
  photoError: boolean = false;

  experiences: any[] = [
    { year: '2017', description: 'დღემდე, ჩვენი კლინიკის გენერალური დირექტორი' },
    { year: '2002', description: 'დღემდე, ჩვენი კომპიუტერული ტომოგრაფიის განყოფილების ხელმძღვანელი' },
    { year: '1995', description: 'დღემდე, კარდიოლოგი / არითმოლოგი' }
  ];

  constructor(
    private doctorService: DoctorService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id && id !== this.doctorId) {
        this.doctorId = id;
        this.loadDoctorDetails();
      }
    });

    if (this.doctorId) {
      this.loadDoctorDetails();
    }
  }

  loadDoctorDetails() {
    this.doctorService.getDoctorById(this.doctorId).subscribe({
      next: (data) => {
        this.doctor = data;
        this.loadDoctorPhoto();
      },
      error: (error) => {
        console.error('Error loading doctor details:', error);
      }
    });
  }

  loadDoctorPhoto() {
    if (this.photoSubscription) {
      this.photoSubscription.unsubscribe();
    }

    this.isLoadingPhoto = true;
    this.photoError = false;

    this.photoSubscription = this.doctorService.getDoctorPhoto(this.doctorId)
      .pipe(
        finalize(() => {
          this.isLoadingPhoto = false;
        })
      )
      .subscribe({
        next: (url) => {
          this.photoUrl = url;
        },
        error: (error) => {
          console.error('Error loading doctor photo:', error);
          this.photoError = true;
         
        }
      });
  }

  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.photoSubscription) {
      this.photoSubscription.unsubscribe();
    }
  }
}