import { Component } from '@angular/core';
interface TableRow {
  name: string;
  category: string;
  image: string;
  rating: number;
}

@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.css'
  
})

export class AdminCategoriesComponent {
  times: number[] = Array(15).fill(0);
  tableData: TableRow[] = [];

  ngOnInit() {
    // Populate with dummy data
    for (let i = 0; i < 20; i++) {
      this.tableData.push({
        name: `გიორგი ხიზაბავა ${i + 1}`,
        category: 'ანიმატორი',
        image: 'assets/Ellipse 23.png',
        rating: Math.floor(Math.random() * 5) + 1
      });
    }
  }

  getRatingStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

}
