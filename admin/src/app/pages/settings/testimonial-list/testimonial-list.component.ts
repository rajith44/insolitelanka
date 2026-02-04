import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TestimonialService } from '../testimonial.service';
import { TestimonialSection, Testimonial } from '../testimonial.model';
import { SwalService } from '../../../core/services/swal.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-testimonial-list',
  templateUrl: './testimonial-list.component.html',
  styleUrls: ['./testimonial-list.component.scss'],
  standalone: false,
})
export class TestimonialListComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  section: TestimonialSection | null = null;
  sectionForm!: FormGroup;
  sectionSaving = false;
  items: Testimonial[] = [];
  searchTerm = '';
  deletingId: string | null = null;

  private router = inject(Router);
  private service = inject(TestimonialService);
  private swal = inject(SwalService);
  private notify = inject(NotificationService);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Travel Insolite' },
      { label: 'Settings' },
      { label: 'Testimonials', active: true },
    ];

    this.sectionForm = this.fb.group({
      sectionBadge: ['', Validators.maxLength(200)],
      sectionHeading: ['', Validators.maxLength(200)],
    });

    this.service.getSection().subscribe(sec => {
      this.section = sec ?? null;
      if (sec) {
        this.sectionForm.patchValue({
          sectionBadge: sec.sectionBadge,
          sectionHeading: sec.sectionHeading,
        });
      }
    });

    this.load();
  }

  load(): void {
    this.service.getAll().subscribe(list => {
      this.items = list ?? [];
    });
  }

  get filteredItems(): Testimonial[] {
    if (!this.searchTerm?.trim()) return this.items;
    const q = this.searchTerm.toLowerCase();
    return this.items.filter(
      t =>
        (t.personName || '').toLowerCase().includes(q) ||
        (t.personComment || '').toLowerCase().includes(q) ||
        (t.country || '').toLowerCase().includes(q)
    );
  }

  saveSection(): void {
    if (this.sectionForm.invalid) return;
    this.sectionSaving = true;
    const v = this.sectionForm.getRawValue();
    this.service.updateSection({
      sectionBadge: v.sectionBadge ?? '',
      sectionHeading: v.sectionHeading ?? '',
    }).subscribe(result => {
      this.sectionSaving = false;
      if (result) {
        this.section = result;
        this.notify.success('Section title updated');
      }
    });
  }

  onAdd(): void {
    this.router.navigate(['/settings/testimonials', 'add']);
  }

  onEdit(id: string): void {
    this.router.navigate(['/settings/testimonials', 'edit', id]);
  }

  onDelete(id: string, name: string): void {
    this.swal
      .confirmDelete({
        title: 'Delete testimonial?',
        text: name ? `Remove "${name}"?` : 'This cannot be undone.',
      })
      .then(confirmed => {
        if (confirmed) {
          this.deletingId = id;
          this.service.delete(id).subscribe(success => {
            this.deletingId = null;
            if (success) {
              this.notify.success('Testimonial deleted');
              this.load();
            }
          });
        }
      });
  }

  isDeleting(id: string): boolean {
    return this.deletingId === id;
  }
}
