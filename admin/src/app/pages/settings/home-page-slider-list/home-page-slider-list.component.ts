import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HomePageSlider } from '../home-page-slider.model';
import { HomePageSliderService } from '../home-page-slider.service';
import { SwalService } from '../../../core/services/swal.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-home-page-slider-list',
  templateUrl: './home-page-slider-list.component.html',
  styleUrls: ['./home-page-slider-list.component.scss'],
  standalone: false
})
export class HomePageSliderListComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  sliders: HomePageSlider[] = [];
  searchTerm = '';

  constructor(
    private service: HomePageSliderService,
    private router: Router,
    private swal: SwalService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Travel Insolite' },
      { label: 'Settings' },
      { label: 'Home Page Slider', active: true }
    ];
    this.loadSliders();
  }

  loadSliders(): void {
    this.service.getAll().subscribe(list => {
      this.sliders = list ?? [];
    });
  }

  get filteredSliders(): HomePageSlider[] {
    if (!this.searchTerm?.trim()) return this.sliders;
    const term = this.searchTerm.toLowerCase();
    return this.sliders.filter(
      s =>
        s.topname?.toLowerCase().includes(term) ||
        s.title?.toLowerCase().includes(term) ||
        s.subtitle?.toLowerCase().includes(term)
    );
  }

  onAdd(): void {
    this.router.navigate(['/settings/home-page-slider/add']);
  }

  onEdit(id: string): void {
    this.router.navigate(['/settings/home-page-slider/edit', id]);
  }

  onView(id: string): void {
    this.router.navigate(['/settings/home-page-slider/view', id]);
  }

  onDelete(id: string, title: string): void {
    this.swal.confirmDelete({
      title: 'Delete slider?',
      text: `Are you sure you want to delete "${title || 'this slide'}"? This cannot be undone.`
    }).then(confirmed => {
      if (confirmed) {
        this.service.delete(id).subscribe(success => {
          if (success) {
            this.notify.success('Slider deleted successfully');
            this.loadSliders();
          }
        });
      }
    });
  }
}
