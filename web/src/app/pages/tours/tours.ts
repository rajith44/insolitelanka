import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TourService, TourListItem } from '../../services/tour.service';

@Component({
  selector: 'app-tours',
  imports: [RouterLink],
  templateUrl: './tours.html',
  styleUrl: './tours.scss',
})
export class Tours implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private tourService = inject(TourService);
  private cdr = inject(ChangeDetectorRef);
  private paramSub: Subscription | null = null;

  loading = true;
  notFound = false;
  tours: TourListItem[] = [];
  categoryTitle = '';

  ngOnInit(): void {
    this.paramSub = this.route.paramMap.subscribe(paramMap => {
      const slug = paramMap.get('slug');
      this.loading = true;
      this.tourService.getList(slug).subscribe({
        next: res => {
          this.tours = res.tours ?? [];
          this.categoryTitle = res.category?.title ?? '';
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

  tourImageUrl(tour: TourListItem): string {
    return tour?.mainImageUrl ?? 'assets/img/home1/package-card-img1.png';
  }
}
