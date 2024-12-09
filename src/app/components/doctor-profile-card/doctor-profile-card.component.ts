import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { DoctorService } from '../../services/doctor.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

interface Experience {
  year: string;
  description: string;
}

@Component({
  selector: 'app-doctor-profile-card',
  templateUrl: './doctor-profile-card.component.html',
  styleUrls: ['./doctor-profile-card.component.css']
})
export class DoctorProfileCardComponent implements OnInit, OnDestroy {
  @Input() doctorId: number = 0;
  private routeSub: Subscription | null = null;
  private photoSubscription: Subscription | null = null;
  private cvSubscription: Subscription | null = null;


  doctor: any = null;
  photoUrl: string = 'assets/png-clipart-anonymous-person-login-google-account-computer-icons-user-activity-miscellaneous-computer.png';
  isLoadingPhoto: boolean = false;
  photoError: boolean = false;
  experiences: Experience[] = [];
  isLoadingCv: boolean = false;
  cvError: string | null = null;

  // experiences: any[] = [
  //   { year: '2017', description: 'დღემდე, ჩვენი კლინიკის გენერალური დირექტორი' },
  //   { year: '2002', description: 'დღემდე, ჩვენი კომპიუტერული ტომოგრაფიის განყოფილების ხელმძღვანელი' },
  //   { year: '1995', description: 'დღემდე, კარდიოლოგი / არითმოლოგი' }
  // ];

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
        this.loadCvExperience();
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
  private parseExperienceFromCv(cvText: string) {
    const experiences: Experience[] = [];
    
    const lines = cvText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  
    // Match three formats: YYYY - დღემდე, YYYY - YYYY, or YYYY–YYYY (with em dash)
    const experiencePattern = /(\d{4})\s*[-–]\s*(დღემდე|\d{4}),\s*(.+?)(?=\s*\d{4}\s*[-–]|$)/g;
  
    for (const line of lines) {
      let match;
      while ((match = experiencePattern.exec(line)) !== null) {
        const [_, startYear, endYear, description] = match;
        experiences.push({
          year: `${startYear} - ${endYear}`,
          description: description.trim()
        });
      }
    }
  
    this.experiences = experiences.sort((a, b) => {
      const yearA = parseInt(a.year.split('-')[0]);
      const yearB = parseInt(b.year.split('-')[0]);
      return yearB - yearA;
    });
  
    if (experiences.length === 0) {
      this.cvError = 'No experience entries found in CV';
    }
  }

  loadCvExperience() {
    this.isLoadingCv = true;
    this.cvError = null;
    this.experiences = [];

    this.cvSubscription = this.doctorService.extractCvText(this.doctorId)
      .pipe(
        finalize(() => {
          this.isLoadingCv = false;
        })
      )
      .subscribe({
        next: (cvText) => {
          try {
            this.parseExperienceFromCv(cvText);
          } catch (error) {
            console.error('Error parsing CV text:', error);
            this.cvError = 'Error parsing experience details';
            this.experiences = [];
          }
        },
        error: (error) => {
          console.error('Error loading CV:', error);
          this.cvError = 'Failed to load experience details';
          this.experiences = [];
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
    if (this.cvSubscription) {
      this.cvSubscription.unsubscribe();
    }
  }
}