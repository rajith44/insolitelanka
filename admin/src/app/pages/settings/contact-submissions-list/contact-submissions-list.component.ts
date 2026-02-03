import { Component, OnInit, inject } from '@angular/core';
import { ContactSubmissionsService, ContactSubmissionItem } from '../contact-submissions.service';

@Component({
  selector: 'app-contact-submissions-list',
  templateUrl: './contact-submissions-list.component.html',
  styleUrls: ['./contact-submissions-list.component.scss'],
  standalone: false
})
export class ContactSubmissionsListComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  items: ContactSubmissionItem[] = [];
  loading = true;

  private service = inject(ContactSubmissionsService);

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Travel Insolite' },
      { label: 'Settings' },
      { label: 'Contact Submissions', active: true }
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
