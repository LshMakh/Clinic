import { Component, ElementRef, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { DoctorService } from '../../services/doctor.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  @Output() categorySelected = new EventEmitter<string|null>();
  @ViewChild('categoriesContent') categoriesContent?: ElementRef;
  
  isExpanded = false;
  selectedCategory: string|null = null;
  categoryCounts: { [key: string]: number } = {}; 
  categories = [
    
    { name: ' ნევროლოგი' },
    {  name: 'ოფთალმოლოგი' },
    {  name: 'დერმატოლოგი' },
    {  name: 'ორთოპედი' },
    {  name: 'გინეკოლოგი' },
    {  name: 'ენდოკრინოლოგი' },
    {  name: 'უროლოგი' },
    {  name: 'გასტროენტეროლოგი' },
    {  name: 'ოტორინოლარინგოლოგი' },
    {  name: 'პულმონოლოგი' },
    {  name: 'რევმატოლოგი' },
    {  name: 'ონკოლოგი' },
    {  name: 'ნეფროლოგი' },
    {  name: 'ჰემატოლოგი' },
    {  name: 'ალერგოლოგი' },
    {  name: 'იმუნოლოგი' },
    {  name: 'ფსიქიატრი' },
    {  name: 'ნეიროქირურგი' },
  ];

  visibleCategories: any[] | undefined;
  hiddenCategories: any[] | undefined;

  constructor(private doctorService:DoctorService){}

  ngOnInit() {
    this.splitCategories();
    this.visibleCategories?.forEach(category => {
      this.loadCategoryCount(category.name);
    });
  }

  splitCategories() {
    this.visibleCategories = this.categories.slice(0, 16);
    this.hiddenCategories = this.categories.slice(16);
  }

  onCategoryClick(categoryName: string) {
    if (this.selectedCategory === categoryName) {
      this.selectedCategory = null;
      this.categorySelected.emit(null);
    } else {
      this.selectedCategory = categoryName;
      this.categorySelected.emit(categoryName);
    }
  }

  loadCategoryCount(category: string) {
    this.doctorService.getCategoryCount(category).subscribe({
      next: (count) => {
        this.categoryCounts[category] = count;
      },
      error: (error) => {
        console.error(`Error loading count for ${category}:`, error);
        this.categoryCounts[category] = 0; // Default to 0 on error
      }
    });
  }

  getCategoryCount(category: string): number {
    return this.categoryCounts[category] || 0;
  }

  toggleView() {
    this.isExpanded = !this.isExpanded;
    
    if (this.isExpanded && this.hiddenCategories) {
      // Load counts for newly visible categories
      this.hiddenCategories.forEach(category => {
        if (!(category.name in this.categoryCounts)) {
          this.loadCategoryCount(category.name);
        }
      });
    }
    
    // If closing the expanded view, scroll to top
    if (!this.isExpanded && this.categoriesContent) {
      setTimeout(() => {
        this.categoriesContent!.nativeElement.scrollTop = 0;
      }, 0);
    }
  }
}