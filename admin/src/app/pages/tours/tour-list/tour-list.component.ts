import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Tour } from '../tour.model';
import { ToursService } from '../tours.service';
import { SwalService } from '../../../core/services/swal.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-tour-list',
  templateUrl: './tour-list.component.html',
  styleUrls: ['./tour-list.component.scss'],
  standalone: false
})
export class TourListComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  tours: Tour[] = [];
  searchTerm = '';

  constructor(
    private service: ToursService,
    private router: Router,
    private swal: SwalService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Travel Insolite' },
      { label: 'Tours' },
      { label: 'Tours', active: true }
    ];
    this.loadTours();
  }

  loadTours(): void {
    this.service.getAll().subscribe(list => {
      this.tours = list ?? [];
    });
  }

  get filteredTours(): Tour[] {
    if (!this.searchTerm?.trim()) return this.tours;
    const term = this.searchTerm.toLowerCase();
    return this.tours.filter(
      t =>
        t.title?.toLowerCase().includes(term) ||
        t.slug?.toLowerCase().includes(term) ||
        (t.categoryNames || []).some(c => c?.toLowerCase().includes(term)) ||
        t.countryName?.toLowerCase().includes(term)
    );
  }

  onAdd(): void {
    this.router.navigate(['/tours/add']);
  }

  onEdit(id: string): void {
    this.router.navigate(['/tours/edit', id]);
  }

  onView(id: string): void {
    this.router.navigate(['/tours/view', id]);
  }

  onDelete(id: string, title: string): void {
    this.swal.confirmDelete({
      title: 'Delete tour?',
      text: `Are you sure you want to delete "${title}"? This cannot be undone.`
    }).then(confirmed => {
      if (confirmed) {
        this.service.delete(id).subscribe(success => {
          if (success) {
            this.notify.success('Tour deleted successfully');
            this.loadTours();
          }
        });
      }
    });
  }
}
