import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Hotel } from '../hotel.model';
import { HotelsService } from '../hotels.service';
import { SwalService } from '../../../core/services/swal.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-hotel-list',
  templateUrl: './hotel-list.component.html',
  styleUrls: ['./hotel-list.component.scss'],
  standalone: false
})
export class HotelListComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  hotels: Hotel[] = [];
  searchTerm = '';

  constructor(
    private service: HotelsService,
    private router: Router,
    private swal: SwalService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Travel Insolite' },
      { label: 'Hotels', active: true }
    ];
    this.loadHotels();
  }

  loadHotels(): void {
    this.service.getAll().subscribe(list => {
      this.hotels = list ?? [];
    });
  }

  get filteredHotels(): Hotel[] {
    if (!this.searchTerm?.trim()) return this.hotels;
    const term = this.searchTerm.toLowerCase();
    return this.hotels.filter(
      h =>
        h.name?.toLowerCase().includes(term) ||
        h.highlights?.toLowerCase().includes(term)
    );
  }

  onAdd(): void {
    this.router.navigate(['/hotels/add']);
  }

  onEdit(id: string): void {
    this.router.navigate(['/hotels/edit', id]);
  }

  onView(id: string): void {
    this.router.navigate(['/hotels/view', id]);
  }

  onDelete(id: string, name: string): void {
    this.swal.confirmDelete({
      title: 'Delete hotel?',
      text: `Are you sure you want to delete "${name}"? This cannot be undone.`
    }).then(confirmed => {
      if (confirmed) {
        this.service.delete(id).subscribe(success => {
          if (success) {
            this.notify.success('Hotel deleted successfully');
            this.loadHotels();
          }
        });
      }
    });
  }

  priceRange(hotel: Hotel): string {
    if (hotel.priceRangeMin != null && hotel.priceRangeMax != null) {
      return `$${hotel.priceRangeMin} - $${hotel.priceRangeMax}`;
    }
    return '-';
  }

  getStars(count: number): number[] {
    return Array.from({ length: Math.min(5, Math.max(0, count || 0)) }, (_, i) => i + 1);
  }
}
