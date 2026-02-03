import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  DestinationService,
  DestinationDetail,
  DestinationListItem,
  DestinationTourListItem,
} from '../../services/destination.service';

@Component({
  selector: 'app-destination',
  imports: [RouterLink],
  templateUrl: './destination.html',
  styleUrl: './destination.scss',
})
export class Destination implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private destinationService = inject(DestinationService);
  private cdr = inject(ChangeDetectorRef);
  private paramSub: Subscription | null = null;

  loading = true;
  notFound = false;
  /** When no slug: list of all destinations */
  destinations: DestinationListItem[] = [];
  /** When slug: single destination detail (with destinationHighlights from API) */
  destination: DestinationDetail | null = null;
  /** When slug: tours for this destination */
  tours: DestinationTourListItem[] = [];

  ngOnInit(): void {
    this.paramSub = this.route.paramMap.subscribe(paramMap => {
      const slug = paramMap.get('countrySlug') ?? paramMap.get('slug');
      this.loading = true;
      this.tours = [];
      this.destinations = [];

      if (slug) {
        this.destinationService.getBySlug(slug).subscribe({
          next: res => {
            if (res) {
              this.destination = res.destination;
              this.tours = res.tours ?? [];
              this.notFound = false;
            } else {
              this.destination = null;
              this.notFound = true;
            }
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.notFound = true;
            this.loading = false;
            this.cdr.detectChanges();
          },
        });
      } else {
        this.destination = null;
        this.destinationService.getList().subscribe({
          next: list => {
            this.destinations = list ?? [];
            this.loading = false;
            this.notFound = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.loading = false;
            this.notFound = true;
            this.cdr.detectChanges();
          },
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.paramSub?.unsubscribe();
    this.paramSub = null;
  }

  formatPrice(value: number): string {
    if (value == null || Number.isNaN(value)) return '$0';
    return (
      '$' +
      Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    );
  }

  tourImageUrl(tour: DestinationTourListItem): string {
    return tour?.mainImageUrl ?? 'assets/img/home1/package-card-img1.png';
  }

  destinationImageUrl(dest: DestinationListItem): string {
    return dest?.mainImageUrl ?? 'assets/img/india.jpg';
  }
}
