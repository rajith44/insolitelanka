import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TestimonialService } from '../testimonial.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-testimonial-form',
  templateUrl: './testimonial-form.component.html',
  styleUrls: ['./testimonial-form.component.scss'],
  standalone: false,
})
export class TestimonialFormComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  form!: FormGroup;
  isEdit = false;
  testimonialId: string | null = null;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(TestimonialService);
  private notify = inject(NotificationService);

  ngOnInit(): void {
    this.testimonialId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.testimonialId && this.testimonialId !== 'add';

    this.breadCrumbItems = this.isEdit
      ? [{ label: 'Travel Insolite' }, { label: 'Settings' }, { label: 'Testimonials', link: '/settings/testimonials' }, { label: 'Edit', active: true }]
      : [{ label: 'Travel Insolite' }, { label: 'Settings' }, { label: 'Testimonials', link: '/settings/testimonials' }, { label: 'Add', active: true }];

    this.form = this.fb.group({
      personName: ['', [Validators.required, Validators.maxLength(200)]],
      country: ['', Validators.maxLength(100)],
      date: ['', Validators.maxLength(50)],
      personComment: ['', Validators.required],
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    });

    if (this.isEdit && this.testimonialId) {
      this.service.getById(this.testimonialId).subscribe(t => {
        if (t) {
          this.form.patchValue({
            personName: t.personName,
            country: t.country,
            date: t.date,
            personComment: t.personComment,
            rating: t.personRating?.length ?? 5,
          });
        }
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const rating = Math.max(1, Math.min(5, Number(v.rating) || 5));
    const payload = {
      personName: v.personName ?? '',
      country: v.country ?? '',
      date: v.date ?? '',
      personComment: v.personComment ?? '',
      personRating: Array.from({ length: rating }, (_, i) => i + 1),
    };

    if (this.isEdit && this.testimonialId) {
      this.service.update(this.testimonialId, payload).subscribe(result => {
        if (result) {
          this.notify.success('Testimonial updated');
          this.router.navigate(['/settings/testimonials']);
        }
      });
    } else {
      this.service.create(payload).subscribe(result => {
        if (result) {
          this.notify.success('Testimonial added');
          this.router.navigate(['/settings/testimonials']);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/settings/testimonials']);
  }
}
