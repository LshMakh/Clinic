import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
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

  visibleCategories: any[] | undefined;
  hiddenCategories: any[] | undefined;

  ngOnInit() {
    this.splitCategories();
  }

  splitCategories() {
    this.visibleCategories = this.categories.slice(0, 14);
    this.hiddenCategories = this.categories.slice(14);
  }

  toggleView() {
    this.isExpanded = !this.isExpanded;
  }
}