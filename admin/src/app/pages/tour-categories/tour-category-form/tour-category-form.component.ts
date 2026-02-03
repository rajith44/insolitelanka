import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TourCategoriesService } from '../tour-categories.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-tour-category-form',
  templateUrl: './tour-category-form.component.html',
  styleUrls: ['./tour-category-form.component.scss'],
  standalone: false
})
export class TourCategoryFormComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  form!: FormGroup;
  isEdit = false;
  viewOnly = false;
  categoryId: string | null = null;

  /** All categories for parent dropdown */
  parentCategories: { id: string; title: string }[] = [];
  /** Options for parent dropdown (excludes self when editing) */
  parentOptions: { id: string; title: string }[] = [];

  /** File ref for upload (not stored in form) */
  imageFile: File | null = null;
  /** Existing media ID when editing (backend keeps if no new file) */
  existingMediaId: number | null = null;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(TourCategoriesService);
  private notify = inject(NotificationService);

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id');
    this.viewOnly = this.route.snapshot.data['viewOnly'] === true;
    this.isEdit = !!this.categoryId && !this.viewOnly;

    this.breadCrumbItems = this.viewOnly
      ? [{ label: 'Travel Insolite' }, { label: 'Tours' }, { label: 'Tour Categories', link: '/tour-categories' }, { label: 'View', active: true }]
      : this.isEdit
        ? [{ label: 'Travel Insolite' }, { label: 'Tours' }, { label: 'Tour Categories', link: '/tour-categories' }, { label: 'Edit', active: true }]
        : [{ label: 'Travel Insolite' }, { label: 'Tours' }, { label: 'Tour Categories', link: '/tour-categories' }, { label: 'Add', active: true }];

    this.form = this.fb.group({
      parentId: [null as string | null],
      title: ['', [Validators.required, Validators.maxLength(200)]],
      slug: ['', Validators.maxLength(200)],
      shortDescription: ['', Validators.maxLength(500)],
      imageUrl: ['']
    });

    this.service.getAll().subscribe(list => {
      this.parentCategories = list.map(c => ({ id: c.id, title: c.title }));
      this.updateParentOptions();
    });

    if (this.categoryId) {
      this.service.getById(this.categoryId).subscribe(cat => {
        if (cat) {
          this.form.patchValue({
            parentId: cat.parentId ?? null,
            title: cat.title,
            slug: cat.slug ?? '',
            shortDescription: cat.shortDescription,
            imageUrl: cat.imageUrl
          });
          this.existingMediaId = cat.media_id ?? null;
          this.imageFile = null;
          this.updateParentOptions();
        }
      });
    } else {
      this.updateParentOptions();
    }
  }

  /** Build parent dropdown options (when editing, exclude current category to avoid self-reference) */
  private updateParentOptions(): void {
    if (this.categoryId) {
      this.parentOptions = this.parentCategories.filter(c => c.id !== this.categoryId);
    } else {
      this.parentOptions = [...this.parentCategories];
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
    if (value.parentId != null && value.parentId !== '') {
      fd.append('parent_id', value.parentId);
    }
    fd.append('title', value.title ?? '');
    fd.append('slug', value.slug ?? '');
    fd.append('short_description', value.shortDescription ?? '');
    if (this.imageFile) {
      fd.append('image', this.imageFile);
    }
    return fd;
  }

  save(): void {
    if (this.form.invalid || this.viewOnly) return;
    const formData = this.buildFormData();

    if (this.isEdit && this.categoryId) {
      this.service.update(this.categoryId, formData).subscribe(result => {
        if (result) {
          this.notify.success('Tour category updated successfully');
          this.router.navigate(['/tour-categories']);
        }
      });
    } else {
      this.service.create(formData).subscribe(result => {
        if (result) {
          this.notify.success('Tour category created successfully');
          this.router.navigate(['/tour-categories']);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/tour-categories']);
  }
}
