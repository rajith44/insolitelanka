import { Component, OnInit, inject } from '@angular/core';
import { NewsletterService, NewsletterSubscriberItem } from '../newsletter.service';

@Component({
  selector: 'app-newsletter-list',
  templateUrl: './newsletter-list.component.html',
  styleUrls: ['./newsletter-list.component.scss'],
  standalone: false
})
export class NewsletterListComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  items: NewsletterSubscriberItem[] = [];
  loading = true;

  private service = inject(NewsletterService);

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Travel Insolite' },
      { label: 'Settings' },
      { label: 'Newsletter', active: true }
    ];
    this.load();
  }

  load(): void {
    this.loading = true;
    this.service.getAll().subscribe(list => {
      this.items = list ?? [];
      this.loading = false;
    });
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return isNaN(d.getTime()) ? iso : d.toLocaleString();
    } catch {
      return iso;
    }
  }
}
