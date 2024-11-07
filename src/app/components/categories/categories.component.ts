import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  @Output() categorySelected = new EventEmitter<string|null>();
  isExpanded = false;
  selectedCategory:string|null=null;
  categories = [
    { count: 23424, name: 'Dermatologist' },
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

  selectCategory(category: string) {
    this.selectedCategory = this.selectedCategory === category ? null : category;
    this.categorySelected.emit(this.selectedCategory);
  }

  ngOnInit() {
    this.splitCategories();
  }

  splitCategories() {
    this.visibleCategories = this.categories.slice(0, 10);
    this.hiddenCategories = this.categories.slice(10);
  }

  onCategoryClick(categoryName:string){
    console.log('Category clicked:', categoryName);
    if(this.selectedCategory===categoryName){
      this.selectedCategory = null;
    }else{
      this.selectedCategory = categoryName;
    }
    
    this.categorySelected.emit(categoryName);
  }

  toggleView() {
    this.isExpanded = !this.isExpanded;
  }
}