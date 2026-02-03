import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Destination } from '../destination.model';
import { DestinationsService } from '../destinations.service';
import { SwalService } from '../../../core/services/swal.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-destination-list',
  templateUrl: './destination-list.component.html',
  styleUrls: ['./destination-list.component.scss'],
  standalone: false
})
export class DestinationListComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  destinations: Destination[] = [];
  searchTerm = '';

  constructor(
    private destinationsService: DestinationsService,
    private router: Router,
    private swal: SwalService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Travel Insolite' },
      { label: 'Destinations', active: true }
    ];
    this.loadDestinations();
  }

  loadDestinations(): void {
    this.destinationsService.getAll().subscribe(list => {
      this.destinations = list ?? [];
    });
  }

  get filteredDestinations(): Destination[] {
    if (!this.searchTerm?.trim()) return this.destinations;
    const term = this.searchTerm.toLowerCase();
    return this.destinations.filter(
      d =>
        d.title?.toLowerCase().includes(term) ||
        d.countryName?.toLowerCase().includes(term) ||
        d.subTitle?.toLowerCase().includes(term)
    );
  }

  onAdd(): void {
    this.router.navigate(['/destinations/add']);
  }

  onEdit(id: string): void {
    this.router.navigate(['/destinations/edit', id]);
  }

  onView(id: string): void {
    this.router.navigate(['/destinations/view', id]);
  }

  onDelete(id: string, title: string): void {
    this.swal.confirmDelete({
      title: 'Delete destination?',
      text: `Are you sure you want to delete "${title}"? This cannot be undone.`
    }).then(confirmed => {
      if (confirmed) {
        this.destinationsService.delete(id).subscribe(success => {
          if (success) {
            this.notify.success('Destination deleted successfully');
            this.loadDestinations();
          }
        });
      }
    });
  }
}
