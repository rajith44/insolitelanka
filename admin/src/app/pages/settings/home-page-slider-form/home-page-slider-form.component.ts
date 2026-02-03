import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HomePageSliderService } from '../home-page-slider.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-home-page-slider-form',
  templateUrl: './home-page-slider-form.component.html',
  styleUrls: ['./home-page-slider-form.component.scss'],
  standalone: false
})
export class HomePageSliderFormComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  form!: FormGroup;
  isEdit = false;
  viewOnly = false;
  sliderId: string | null = null;

  imageFile: File | null = null;
  existingMediaId: number | null = null;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(HomePageSliderService);
  private notify = inject(NotificationService);

  ngOnInit(): void {
    this.sliderId = this.route.snapshot.paramMap.get('id');
    this.viewOnly = this.route.snapshot.data['viewOnly'] === true;
    this.isEdit = !!this.sliderId && !this.viewOnly;

    this.breadCrumbItems = this.viewOnly
      ? [{ label: 'Travel Insolite' }, { label: 'Settings' }, { label: 'Home Page Slider', link: '/settings/home-page-slider' }, { label: 'View', active: true }]
      : this.isEdit
        ? [{ label: 'Travel Insolite' }, { label: 'Settings' }, { label: 'Home Page Slider', link: '/settings/home-page-slider' }, { label: 'Edit', active: true }]
        : [{ label: 'Travel Insolite' }, { label: 'Settings' }, { label: 'Home Page Slider', link: '/settings/home-page-slider' }, { label: 'Add', active: true }];

    this.form = this.fb.group({
      topname: ['', Validators.maxLength(200)],
      title: ['', Validators.maxLength(200)],
      subtitle: ['', Validators.maxLength(500)],
      imageUrl: ['']
    });

    if (this.sliderId) {
      this.service.getById(this.sliderId).subscribe(s => {
        if (s) {
          this.form.patchValue({
            topname: s.topname,
            title: s.title,
            subtitle: s.subtitle,
            imageUrl: s.imageUrl
          });
          this.existingMediaId = s.media_id ?? null;
          this.imageFile = null;
        }
      });
    }
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.imageFile = file;
      this.existingMediaId = null;
      const reader = new FileReader();
      reader.onload = () => this.form.patchValue({ imageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  private buildFormData(): FormData {
    const value = this.form.getRawValue();
    const fd = new FormData();
    fd.append('topname', value.topname ?? '');
    fd.append('title', value.title ?? '');
    fd.append('subtitle', value.subtitle ?? '');
    if (this.imageFile) {
      fd.append('image', this.imageFile);
    }
    return fd;
  }

  save(): void {
    if (this.form.invalid || this.viewOnly) return;
    const formData = this.buildFormData();

    if (this.isEdit && this.sliderId) {
      this.service.update(this.sliderId, formData).subscribe(result => {
        if (result) {
          this.notify.success('Slider updated successfully');
          this.router.navigate(['/settings/home-page-slider']);
        }
      });
    } else {
      this.service.create(formData).subscribe(result => {
        if (result) {
          this.notify.success('Slider created successfully');
          this.router.navigate(['/settings/home-page-slider']);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/settings/home-page-slider']);
  }
}
