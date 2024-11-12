// doctor-profile-card.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { DoctorService } from '../../services/doctor.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-doctor-profile-card',
  templateUrl: './doctor-profile-card.component.html',
  styleUrls: ['./doctor-profile-card.component.css']
})
export class DoctorProfileCardComponent implements OnInit {
  @Input() doctorId: number = 0;
  private routeSub: Subscription | null = null;

  doctor: any = null;
  experiences: any[] = [
    { year: '2017', description: 'დღემდე, ჩვენი კლინიკის გენერალური დირექტორი' },
    { year: '2002', description: 'დღემდე, ჩვენი კომპიუტერული ტომოგრაფიის განყოფილების ხელმძღვანელი' },
    { year: '1995', description: 'დღემდე, კარდიოლოგი / არითმოლოგი' }
  ];

  constructor(private doctorService: DoctorService, private route:ActivatedRoute) {}

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      const id = +params['id']; // Convert route param to number
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
        console.log(this.doctor.rating);
      },
      error: (error) => {
        console.error('Error loading doctor details:', error);
      }
    });
  }

  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }
}