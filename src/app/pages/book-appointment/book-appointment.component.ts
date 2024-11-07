import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-book-appointment',
  templateUrl: './book-appointment.component.html',
  styleUrl: './book-appointment.component.css'
})
export class BookAppointmentComponent implements OnInit {
  doctorId :number=0;
  isExpanded = false;
categories = [
  { count: 23424, name: 'კარდიოლოგი' },
  { count: 15678, name: 'პედიატრი' },
  { count: 19876, name: 'ნევროლოგი' },
  { count: 12345, name: 'ოფთალმოლოგი' },
  { count: 21098, name: 'დერმატოლოგი' },
  { count: 18765, name: 'ორთოპედი' },
  { count: 14567, name: 'გინეკოლოგი' },
  { count: 17890, name: 'ენდოკრინოლოგი' },
  { count: 13456, name: 'უროლოგი' },
  { count: 16789, name: 'გასტროენტეროლოგი' },
  { count: 20987, name: 'ოტორინოლარინგოლოგი' },
  { count: 11234, name: 'პულმონოლოგი' },
  { count: 15678, name: 'რევმატოლოგი' },
  { count: 19876, name: 'ონკოლოგი' },
  { count: 22345, name: 'ნეფროლოგი' },
  { count: 18765, name: 'ჰემატოლოგი' },
  { count: 14567, name: 'ალერგოლოგი' },
  { count: 17890, name: 'იმუნოლოგი' },
  { count: 21098, name: 'ფსიქიატრი' },
  { count: 13456, name: 'ნეიროქირურგი' },
];
selectedDate: Date | undefined;
minDate: Date;
maxDate: Date;

constructor(private route:ActivatedRoute) {
  this.minDate = new Date(); // Set minimum date to today
  this.maxDate = new Date();
  this.maxDate.setMonth(this.maxDate.getMonth() + 3); // Set maximum date to 3 months from now
}

visibleCategories: any[] | undefined;
hiddenCategories: any[] | undefined;

ngOnInit() {
  this.route.params.subscribe(params => {
    this.doctorId = +params['id']; // Convert string to number using '+'
  });
  this.splitCategories();
}

splitCategories() {
  this.visibleCategories = this.categories.slice(0, 14);
  this.hiddenCategories = this.categories.slice(14);
}
onDateSelect(event: Date) {
  console.log('Selected date:', event);
  // Add your logic for handling the selected date
}

toggleView() {
  this.isExpanded = !this.isExpanded;
}

}
