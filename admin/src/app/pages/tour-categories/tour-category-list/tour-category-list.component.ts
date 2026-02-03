import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TourCategory } from '../tour-category.model';
import { TourCategoriesService } from '../tour-categories.service';
import { SwalService } from '../../../core/services/swal.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-tour-category-list',
  templateUrl: './tour-category-list.component.html',
  styleUrls: ['./tour-category-list.component.scss'],
  standalone: false
})
export class TourCategoryListComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  categories: TourCategory[] = [];
  searchTerm = '';

  constructor(
    private service: TourCategoriesService,
    private router: Router,
    private swal: SwalService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Travel Insolite' },
      { label: 'Tours' },
      { label: 'Tour Categories', active: true }
    ];
    this.loadCategories();
  }

  loadCategories(): void {
    this.service.getAll().subscribe(list => {
      this.categories = list ?? [];
    });
  }

  get filteredCategories(): TourCategory[] {
    if (!this.searchTerm?.trim()) return this.categories;
    const term = this.searchTerm.toLowerCase();
    return this.categories.filter(
      c => c.title?.toLowerCase().includes(term) || c.shortDescription?.toLowerCase().includes(term)
    );
  }

  onAdd(): void {
    this.router.navigate(['/tour-categories/add']);
  }

  onEdit(id: string): void {
    this.router.navigate(['/tour-categories/edit', id]);
  }

  onView(id: string): void {
    this.router.navigate(['/tour-categories/view', id]);
  }

  onDelete(id: string, title: string): void {
    this.swal.confirmDelete({
      title: 'Delete category?',
      text: `Are you sure you want to delete "${title}"? This cannot be undone.`
    }).then(confirmed => {
      if (confirmed) {
        this.service.delete(id).subscribe(success => {
          if (success) {
            this.notify.success('Category deleted successfully');
            this.loadCategories();
          }
        });
      }
    });
  }
}
