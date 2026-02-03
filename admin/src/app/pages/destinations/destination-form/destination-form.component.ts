import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { DestinationsService } from '../destinations.service';
import { Destination, DestinationHighlight } from '../destination.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-destination-form',
  templateUrl: './destination-form.component.html',
  styleUrls: ['./destination-form.component.scss'],
  standalone: false
})
export class DestinationFormComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  form!: FormGroup;
  isEdit = false;
  viewOnly = false;
  destinationId: string | null = null;
  countries: { id: string; name: string }[] = [];
  public Editor = ClassicEditor;

  /** File refs for upload (not stored in form) */
  mainImageFile: File | null = null;
  highlightFiles: (File | null)[] = [];
  galleryFiles: File[] = [];
  /** Existing media IDs when editing (for backend to keep) */
  existingMainMediaId: number | null = null;
  existingHighlightMediaIds: (number | null)[] = [];
  existingGalleryMediaIds: number[] = [];

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destinationsService = inject(DestinationsService);
  private notify = inject(NotificationService);

  ngOnInit(): void {
    this.countries = this.destinationsService.getCountries();
    this.destinationId = this.route.snapshot.paramMap.get('id');
    this.viewOnly = this.route.snapshot.data['viewOnly'] === true;
    this.isEdit = !!this.destinationId && !this.viewOnly;

    this.breadCrumbItems = this.viewOnly
      ? [{ label: 'Travel Insolite' }, { label: 'Destinations', link: '/destinations' }, { label: 'View', active: true }]
      : this.isEdit
        ? [{ label: 'Travel Insolite' }, { label: 'Destinations', link: '/destinations' }, { label: 'Edit', active: true }]
        : [{ label: 'Travel Insolite' }, { label: 'Destinations', link: '/destinations' }, { label: 'Add', active: true }];

    this.buildForm();

    if (this.destinationId) {
      this.destinationsService.getById(this.destinationId).subscribe(dest => {
        if (dest) {
          this.form.patchValue({
            title: dest.title,
            slug: dest.slug ?? '',
            countryId: dest.countryId,
            mainDescription: dest.mainDescription,
            subTitle: dest.subTitle,
            subDescription: dest.subDescription,
            mainImageUrl: dest.mainImageUrl
          });
          this.existingMainMediaId = dest.main_media_id ?? null;
          this.highlights.clear();
          this.highlightFiles = [];
          this.existingHighlightMediaIds = [];
          (dest.destinationHighlights || []).forEach((h) => {
            this.highlights.push(this.createHighlightGroup(h));
            this.highlightFiles.push(null);
            this.existingHighlightMediaIds.push(h.media_id ?? null);
          });
          this.imageUrls.clear();
          (dest.imageUrls || []).forEach(url => this.imageUrls.push(this.fb.control(url)));
          this.existingGalleryMediaIds = dest.gallery_media_ids ?? [];
          this.galleryFiles = [];
        }
      });
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      slug: ['', Validators.maxLength(200)],
      countryId: ['', Validators.required],
      mainDescription: [''],
      subTitle: ['', Validators.maxLength(200)],
      subDescription: [''],
      destinationHighlights: this.fb.array([]),
      mainImageUrl: [''],
      imageUrls: this.fb.array([])
    });
  }

  get highlights(): FormArray {
    return this.form.get('destinationHighlights') as FormArray;
  }

  get imageUrls(): FormArray {
    return this.form.get('imageUrls') as FormArray;
  }

  private createHighlightGroup(h?: DestinationHighlight): FormGroup {
    return this.fb.group({
      imageUrl: [h?.imageUrl ?? ''],
      shortDescription: [h?.shortDescription ?? '']
    });
  }

  addHighlight(): void {
    this.highlights.push(this.createHighlightGroup());
    this.highlightFiles.push(null);
    this.existingHighlightMediaIds.push(null);
  }

  removeHighlight(index: number): void {
    this.highlights.removeAt(index);
    this.highlightFiles.splice(index, 1);
    this.existingHighlightMediaIds.splice(index, 1);
  }

  onMainImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.mainImageFile = file;
      const reader = new FileReader();
      reader.onload = () => this.form.patchValue({ mainImageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  onGalleryImagesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files?.length) {
      for (let i = 0; i < files.length; i++) {
        this.galleryFiles.push(files[i]);
        const reader = new FileReader();
        reader.onload = () => this.imageUrls.push(this.fb.control(reader.result as string));
        reader.readAsDataURL(files[i]);
      }
    }
    input.value = '';
  }

  onHighlightImageChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      if (this.highlightFiles.length <= index) {
        this.highlightFiles.length = index + 1;
        this.existingHighlightMediaIds.length = index + 1;
      }
      this.highlightFiles[index] = file;
      this.existingHighlightMediaIds[index] = null;
      const reader = new FileReader();
      reader.onload = () => this.highlights.at(index).patchValue({ imageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  removeGalleryImage(index: number): void {
    if (index < this.existingGalleryMediaIds.length) {
      this.existingGalleryMediaIds.splice(index, 1);
      this.imageUrls.removeAt(index);
    } else {
      const fileIndex = index - this.existingGalleryMediaIds.length;
      this.galleryFiles.splice(fileIndex, 1);
      this.imageUrls.removeAt(index);
    }
  }

  private buildFormData(): FormData {
    const value = this.form.getRawValue();
    const fd = new FormData();
    fd.append('title', value.title ?? '');
    fd.append('slug', value.slug ?? '');
    fd.append('country_id', value.countryId ?? '');
    fd.append('main_description', value.mainDescription ?? '');
    fd.append('sub_title', value.subTitle ?? '');
    fd.append('sub_description', value.subDescription ?? '');

    if (this.mainImageFile) {
      fd.append('main_image', this.mainImageFile);
    }

    const highlightDescriptions = (value.destinationHighlights || []).map((h: any) => h.shortDescription ?? '');
    highlightDescriptions.forEach((desc: string, i: number) => fd.append('highlight_short_descriptions[]', desc));
    this.highlightFiles.forEach((file, i) => {
      if (file) fd.append(`highlight_images[${i}]`, file);
    });
    this.existingHighlightMediaIds.forEach((id, i) => {
      if (id != null) fd.append(`highlight_media_ids[${i}]`, String(id));
    });

    this.existingGalleryMediaIds.forEach(id => fd.append('gallery_media_ids[]', String(id)));
    this.galleryFiles.forEach(file => fd.append('gallery_images[]', file));

    return fd;
  }

  save(): void {
    if (this.form.invalid || this.viewOnly) return;
    const formData = this.buildFormData();

    if (this.isEdit && this.destinationId) {
      this.destinationsService.update(this.destinationId, formData).subscribe(result => {
        if (result) {
          this.notify.success('Destination updated successfully');
          this.router.navigate(['/destinations']);
        }
      });
    } else {
      this.destinationsService.create(formData).subscribe(result => {
        if (result) {
          this.notify.success('Destination created successfully');
          this.router.navigate(['/destinations']);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/destinations']);
  }
}
