import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Hotel } from '../hotel.model';
import { HotelsService } from '../hotels.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MediaPickerService } from '../../../core/services/media-picker.service';

@Component({
  selector: 'app-hotel-form',
  templateUrl: './hotel-form.component.html',
  styleUrls: ['./hotel-form.component.scss'],
  standalone: false
})
export class HotelFormComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  form!: FormGroup;
  isEdit = false;
  viewOnly = false;
  hotelId: string | null = null;
  starOptions = [1, 2, 3, 4, 5];
  public Editor = ClassicEditor;

  galleryFiles: File[] = [];
  existingGalleryMediaIds: number[] = [];

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(HotelsService);
  private notify = inject(NotificationService);
  private mediaPicker = inject(MediaPickerService);

  ngOnInit(): void {
    this.hotelId = this.route.snapshot.paramMap.get('id');
    this.viewOnly = this.route.snapshot.data['viewOnly'] === true;
    this.isEdit = !!this.hotelId && !this.viewOnly;

    this.breadCrumbItems = this.viewOnly
      ? [{ label: 'Travel Insolite' }, { label: 'Hotels', link: '/hotels' }, { label: 'View', active: true }]
      : this.isEdit
        ? [{ label: 'Travel Insolite' }, { label: 'Hotels', link: '/hotels' }, { label: 'Edit', active: true }]
        : [{ label: 'Travel Insolite' }, { label: 'Hotels', link: '/hotels' }, { label: 'Add', active: true }];

    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      slug: ['', Validators.maxLength(200)],
      description: [''],
      imageUrls: this.fb.array([]),
      highlights: ['', Validators.maxLength(500)],
      priceRangeMin: [0, [Validators.min(0)]],
      priceRangeMax: [0, [Validators.min(0)]],
      star: [3, [Validators.required, Validators.min(1), Validators.max(5)]]
    });

    if (this.hotelId) {
      this.service.getById(this.hotelId).subscribe(hotel => {
        if (hotel) {
          this.form.patchValue({
            name: hotel.name,
            slug: hotel.slug ?? '',
            description: hotel.description,
            highlights: hotel.highlights,
            priceRangeMin: hotel.priceRangeMin ?? 0,
            priceRangeMax: hotel.priceRangeMax ?? 0,
            star: hotel.star ?? 3
          });
          this.imageUrlsArray.clear();
          (hotel.imageUrls || []).forEach(url => this.imageUrlsArray.push(this.fb.control(url)));
          this.existingGalleryMediaIds = hotel.gallery_media_ids ?? [];
          this.galleryFiles = [];
        }
      });
    }
  }

  get imageUrlsArray(): FormArray {
    return this.form.get('imageUrls') as FormArray;
  }

  onImagesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files?.length) {
      for (let i = 0; i < files.length; i++) {
        this.galleryFiles.push(files[i]);
        const reader = new FileReader();
        reader.onload = () => this.imageUrlsArray.push(this.fb.control(reader.result as string));
        reader.readAsDataURL(files[i]);
      }
    }
    input.value = '';
  }

  removeImage(index: number): void {
    if (index < this.existingGalleryMediaIds.length) {
      this.existingGalleryMediaIds.splice(index, 1);
      this.imageUrlsArray.removeAt(index);
    } else {
      const fileIndex = index - this.existingGalleryMediaIds.length;
      this.galleryFiles.splice(fileIndex, 1);
      this.imageUrlsArray.removeAt(index);
    }
  }

  openMediaPickerGallery(): void {
    this.mediaPicker.openMultipleImages().then((items) => {
      if (items?.length) {
        items.forEach((item) => {
          if (item.url) {
            this.existingGalleryMediaIds.push(item.id);
            this.imageUrlsArray.push(this.fb.control(item.url));
          }
        });
      }
    });
  }

  private buildFormData(): FormData {
    const value = this.form.getRawValue();
    const fd = new FormData();
    fd.append('name', value.name ?? '');
    fd.append('slug', value.slug ?? '');
    fd.append('description', value.description ?? '');
    fd.append('highlights', value.highlights ?? '');
    fd.append('price_range_min', String(Number(value.priceRangeMin) || 0));
    fd.append('price_range_max', String(Number(value.priceRangeMax) || 0));
    fd.append('star', String(Number(value.star) || 3));

    this.existingGalleryMediaIds.forEach(id => fd.append('gallery_media_ids[]', String(id)));
    this.galleryFiles.forEach(file => fd.append('gallery_images[]', file));

    return fd;
  }

  save(): void {
    if (this.form.invalid || this.viewOnly) return;
    const formData = this.buildFormData();

    if (this.isEdit && this.hotelId) {
      this.service.update(this.hotelId, formData).subscribe(result => {
        if (result) {
          this.notify.success('Hotel updated successfully');
          this.router.navigate(['/hotels']);
        }
      });
    } else {
      this.service.create(formData).subscribe(result => {
        if (result) {
          this.notify.success('Hotel created successfully');
          this.router.navigate(['/hotels']);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/hotels']);
  }
}
