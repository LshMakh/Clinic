import { Component, Input } from '@angular/core';


interface Experience {
  year: string;
  description: string;
}

@Component({
  selector: 'app-doctor-profile-card',
  templateUrl: './doctor-profile-card.component.html',
  styleUrls: ['./doctor-profile-card.component.css']
})
export class DoctorProfileCardComponent {
  @Input() name: string = 'გიორგი ხორავა';
  @Input() specialization: string = 'კარდიოლოგი / არითმოლოგი';
  @Input() rating: number = 5;
  @Input() photoUrl: string = 'assets/Ellipse 5.png';
  @Input() experiences: Experience[] = [
    { year: '2017', description: 'დღემდე, ჩვენი კლინიკის გენერალური დირექტორი' },
    { year: '2002', description: 'დღემდე, ჩვენი კომპიუტერული ტომოგრაფიის განყოფილების ხელმძღვანელი' },
    { year: '1995', description: 'დღემდე, კარდიოლოგი / არითმოლოგი' }
  ];

  getRatingStars(): string {
    return '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
  }
}

