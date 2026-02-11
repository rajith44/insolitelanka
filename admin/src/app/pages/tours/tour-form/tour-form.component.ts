import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ToursService } from '../tours.service';
import { Tour, ItineraryItem, FAQItem, ExtraServiceItem, ITINERARY_MEALS_OPTIONS, ITINERARY_ACTIVITY_OPTIONS } from '../tour.model';
import { NotificationService } from '../../../core/services/notification.service';
import { MediaPickerService } from '../../../core/services/media-picker.service';

@Component({
  selector: 'app-tour-form',
  templateUrl: './tour-form.component.html',
  styleUrls: ['./tour-form.component.scss'],
  standalone: false
})
export class TourFormComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  form!: FormGroup;
  isEdit = false;
  viewOnly = false;
  tourId: string | null = null;
  categories: { id: string; title: string }[] = [];
  destinations: { id: string; title: string }[] = [];
  hotels: { id: string; name: string }[] = [];
  countries: { id: string; name: string }[] = [];
  public Editor = ClassicEditor;
  readonly mealsOptions = ITINERARY_MEALS_OPTIONS;
  readonly activityOptions = ITINERARY_ACTIVITY_OPTIONS;

  /** File refs for upload (not stored in form) */
  mainImageFile: File | null = null;
  galleryFiles: File[] = [];
  /** Itinerary day images: index -> File[] (new uploads per day) */
  itineraryImageFiles: Record<number, File[]> = {};
  /** Existing media IDs when editing (for backend to keep) */
  existingMainMediaId: number | null = null;
  existingGalleryMediaIds: number[] = [];

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ToursService);
  private notify = inject(NotificationService);
  private mediaPicker = inject(MediaPickerService);

  ngOnInit(): void {
    this.tourId = this.route.snapshot.paramMap.get('id');
    this.viewOnly = this.route.snapshot.data['viewOnly'] === true;
    this.isEdit = !!this.tourId && !this.viewOnly;
    this.countries = this.service.getCountries();

    this.breadCrumbItems = this.viewOnly
      ? [{ label: 'Travel Insolite' }, { label: 'Tours' }, { label: 'Tours', link: '/tours' }, { label: 'View', active: true }]
      : this.isEdit
        ? [{ label: 'Travel Insolite' }, { label: 'Tours' }, { label: 'Tours', link: '/tours' }, { label: 'Edit', active: true }]
        : [{ label: 'Travel Insolite' }, { label: 'Tours' }, { label: 'Tours', link: '/tours' }, { label: 'Add', active: true }];

    this.buildForm();

    this.service.getEditData(this.tourId).subscribe(data => {
      this.categories = data.categories ?? [];
      this.destinations = data.destinations ?? [];
      this.hotels = data.hotels ?? [];
      const tour = data.tour;
      if (tour) {
        this.form.patchValue({
          categoryIds: tour.categoryIds || [],
          title: tour.title,
          slug: tour.slug,
          shortTitle: tour.shortTitle,
          description: tour.description,
          mainImageUrl: tour.mainImageUrl ?? '',
          pricePerPerson: tour.pricePerPerson ?? 0,
          duration: tour.duration ?? '',
          maxPeople: tour.maxPeople ?? 0,
          countryId: tour.countryId ?? '',
          included: tour.included ?? '',
          excluded: tour.excluded ?? '',
          highlights: tour.highlights ?? '',
          mapEmbed: tour.mapEmbed ?? '',
          videoUrl: tour.videoUrl ?? ''
        });
        this.existingMainMediaId = tour.main_media_id ?? null;
        this.existingGalleryMediaIds = tour.gallery_media_ids ?? [];
        this.galleryFiles = [];
        this.imageUrlsArray.clear();
        (tour.imageUrls || []).forEach(url => this.imageUrlsArray.push(this.fb.control(url)));
        this.itineraryArray.clear();
        this.itineraryImageFiles = {};
        (tour.itinerary || []).forEach(i => this.itineraryArray.push(this.createItineraryGroup(i)));
        this.faqArray.clear();
        (tour.faq || []).forEach(f => this.faqArray.push(this.createFaqGroup(f)));
        this.extraServicesArray.clear();
        (tour.extraServices || []).forEach(e => this.extraServicesArray.push(this.createExtraServiceGroup(e)));
      }
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      categoryIds: [[]],
      title: ['', [Validators.required, Validators.maxLength(200)]],
      slug: ['', Validators.maxLength(200)],
      shortTitle: ['', Validators.maxLength(200)],
      description: [''],
      pricePerPerson: [0, [Validators.required, Validators.min(0)]],
      duration: ['', Validators.maxLength(100)],
      maxPeople: [0, [Validators.min(0)]],
      countryId: [''],
      included: [''],
      excluded: [''],
      highlights: [''],
      mapEmbed: [''],
      videoUrl: [''],
      mainImageUrl: [''],
      imageUrls: this.fb.array([]),
      itinerary: this.fb.array([]),
      faq: this.fb.array([]),
      extraServices: this.fb.array([])
    });
  }

  get imageUrlsArray(): FormArray {
    return this.form.get('imageUrls') as FormArray;
  }

  get itineraryArray(): FormArray {
    return this.form.get('itinerary') as FormArray;
  }

  get faqArray(): FormArray {
    return this.form.get('faq') as FormArray;
  }

  get extraServicesArray(): FormArray {
    return this.form.get('extraServices') as FormArray;
  }

  private createItineraryGroup(i?: ItineraryItem & { day?: string; title?: string; content?: string }): FormGroup {
    const raw = i as any;
    return this.fb.group({
      dayTitle: [i?.dayTitle ?? raw?.day ?? ''],
      mainTitle: [i?.mainTitle ?? raw?.title ?? ''],
      description: [i?.description ?? raw?.content ?? ''],
      dayHighlights: [i?.dayHighlights ?? raw?.day_highlights ?? ''],
      dayActivities: [i?.dayActivities ?? raw?.day_activities ?? ''],
      fromCity: [i?.fromCity ?? raw?.from_city ?? ''],
      toCity: [i?.toCity ?? raw?.to_city ?? ''],
      travelMileageKm: [i?.travelMileageKm ?? raw?.travel_mileage_km ?? null],
      walkingTime: [i?.walkingTime ?? raw?.walking_time ?? ''],
      mealsIncluded: [i?.mealsIncluded ?? raw?.meals_included ?? []],
      elevationGain: [i?.elevationGain ?? raw?.elevation_gain ?? ''],
      elevationLoss: [i?.elevationLoss ?? raw?.elevation_loss ?? ''],
      distanceCovered: [i?.distanceCovered ?? raw?.distance_covered ?? ''],
      transfer: [i?.transfer ?? raw?.transfer ?? ''],
      activity: [i?.activity ?? raw?.activity ?? []],
      destinationIds: [i?.destinationIds ?? []],
      hotelIds: [i?.hotelIds ?? []],
      image_media_ids: [i?.image_media_ids ?? []],
      imageUrls: this.fb.array((i?.imageUrls || []).map((url: string) => this.fb.control(url)))
    });
  }

  private createFaqGroup(f?: FAQItem): FormGroup {
    return this.fb.group({
      question: [f?.question ?? ''],
      answer: [f?.answer ?? '']
    });
  }

  private createExtraServiceGroup(e?: ExtraServiceItem): FormGroup {
    return this.fb.group({
      name: [e?.name ?? ''],
      price: [e?.price ?? 0]
    });
  }

  addItinerary(): void {
    this.itineraryArray.push(this.createItineraryGroup());
  }

  removeItinerary(index: number): void {
    this.itineraryArray.removeAt(index);
    // Reindex itineraryImageFiles so indices match form
    const next: Record<number, File[]> = {};
    Object.keys(this.itineraryImageFiles).forEach(k => {
      const i = Number(k);
      if (i < index) next[i] = this.itineraryImageFiles[i];
      else if (i > index) next[i - 1] = this.itineraryImageFiles[i];
    });
    this.itineraryImageFiles = next;
  }

  addFaq(): void {
    this.faqArray.push(this.createFaqGroup());
  }

  removeFaq(index: number): void {
    this.faqArray.removeAt(index);
  }

  addExtraService(): void {
    this.extraServicesArray.push(this.createExtraServiceGroup());
  }

  removeExtraService(index: number): void {
    this.extraServicesArray.removeAt(index);
  }

  getItineraryImages(index: number): FormArray {
    return this.itineraryArray.at(index).get('imageUrls') as FormArray;
  }

  onItineraryImagesChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files?.length) {
      const newFiles = Array.from(files);
      this.itineraryImageFiles[index] = (this.itineraryImageFiles[index] ?? []).concat(newFiles);
      const imgArray = this.getItineraryImages(index);
      let read = 0;
      for (let i = 0; i < newFiles.length; i++) {
        const reader = new FileReader();
        reader.onload = () => {
          imgArray.push(this.fb.control(reader.result as string));
          read++;
        };
        reader.readAsDataURL(newFiles[i]);
      }
    }
    input.value = '';
  }

  removeItineraryImage(itineraryIndex: number, imageIndex: number): void {
    const group = this.itineraryArray.at(itineraryIndex) as FormGroup;
    const mediaIds = (group.get('image_media_ids')?.value ?? []) as number[];
    const imgArray = this.getItineraryImages(itineraryIndex);
    if (imageIndex < mediaIds.length) {
      mediaIds.splice(imageIndex, 1);
      group.patchValue({ image_media_ids: [...mediaIds] });
    } else {
      const fileIndex = imageIndex - mediaIds.length;
      const files = this.itineraryImageFiles[itineraryIndex] ?? [];
      files.splice(fileIndex, 1);
      this.itineraryImageFiles[itineraryIndex] = files;
    }
    imgArray.removeAt(imageIndex);
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

  openMediaPickerMainImage(): void {
    this.mediaPicker.openSingleImage().then((item) => {
      if (item?.url) {
        this.mainImageFile = null;
        this.existingMainMediaId = item.id;
        this.form.patchValue({ mainImageUrl: item.url });
      }
    });
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

  openMediaPickerItineraryImages(itineraryIdx: number): void {
    this.mediaPicker.openMultipleImages().then((items) => {
      if (items?.length) {
        const group = this.itineraryArray.at(itineraryIdx) as FormGroup;
        const mediaIds = (group.get('image_media_ids')?.value ?? []) as number[];
        const imgArray = this.getItineraryImages(itineraryIdx);
        items.forEach((item) => {
          if (item.url) {
            mediaIds.push(item.id);
            imgArray.push(this.fb.control(item.url));
          }
        });
        group.patchValue({ image_media_ids: mediaIds });
      }
    });
  }

  onGalleryImagesChange(event: Event): void {
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

  removeGalleryImage(index: number): void {
    if (index < this.existingGalleryMediaIds.length) {
      this.existingGalleryMediaIds.splice(index, 1);
      this.imageUrlsArray.removeAt(index);
    } else {
      const fileIndex = index - this.existingGalleryMediaIds.length;
      this.galleryFiles.splice(fileIndex, 1);
      this.imageUrlsArray.removeAt(index);
    }
  }

  private buildFormData(): FormData {
    const value = this.form.getRawValue();
    const fd = new FormData();
    fd.append('title', value.title ?? '');
    fd.append('slug', value.slug ?? value.title?.toLowerCase().replace(/\s+/g, '-') ?? '');
    fd.append('short_title', value.shortTitle ?? '');
    fd.append('description', value.description ?? '');
    fd.append('price_per_person', String(Number(value.pricePerPerson) || 0));
    fd.append('duration', value.duration ?? '');
    fd.append('max_people', String(Number(value.maxPeople) || 0));
    fd.append('country_id', value.countryId ?? '');
    fd.append('included', value.included ?? '');
    fd.append('excluded', value.excluded ?? '');
    fd.append('highlights', value.highlights ?? '');
    fd.append('map_embed', value.mapEmbed ?? '');
    fd.append('video_url', value.videoUrl ?? '');
    fd.append('category_ids', JSON.stringify(value.categoryIds || []));
    fd.append('itinerary', JSON.stringify((value.itinerary || []).map((it: any) => ({
      day: it.dayTitle || it.day,
      title: it.mainTitle || it.title,
      mainTitle: it.mainTitle,
      content: it.description || it.content,
      description: it.description,
      day_highlights: it.dayHighlights ?? '',
      day_activities: it.dayActivities ?? '',
      from_city: it.fromCity ?? '',
      to_city: it.toCity ?? '',
      travel_mileage_km: it.travelMileageKm != null ? Number(it.travelMileageKm) : null,
      walking_time: it.walkingTime ?? '',
      meals_included: it.mealsIncluded ?? [],
      mealsIncluded: it.mealsIncluded ?? [],
      elevation_gain: it.elevationGain ?? '',
      elevationGain: it.elevationGain ?? '',
      elevation_loss: it.elevationLoss ?? '',
      elevationLoss: it.elevationLoss ?? '',
      distance_covered: it.distanceCovered ?? '',
      distanceCovered: it.distanceCovered ?? '',
      transfer: it.transfer ?? '',
      activity: it.activity ?? [],
      destinationIds: it.destinationIds || [],
      hotelIds: it.hotelIds || [],
      image_media_ids: (it.image_media_ids ?? []).map((id: number) => Number(id))
    }))));
    // Append itinerary day images like gallery_images: itinerary[0][images][], itinerary[1][images][], ...
    (value.itinerary || []).forEach((_: any, index: number) => {
      const files = this.itineraryImageFiles[index] ?? [];
      files.forEach(file => fd.append(`itinerary[${index}][images][]`, file));
    });
    fd.append('faq', JSON.stringify((value.faq || []).map((f: any) => ({ question: f.question, answer: f.answer }))));
    fd.append('extra_services', JSON.stringify((value.extraServices || []).map((e: any) => ({ name: e.name, price: Number(e.price) || 0 }))));

    if (this.mainImageFile) {
      fd.append('main_image', this.mainImageFile);
    } else if (this.existingMainMediaId != null) {
      fd.append('main_media_id', String(this.existingMainMediaId));
    }
    this.existingGalleryMediaIds.forEach(id => fd.append('gallery_media_ids[]', String(id)));
    this.galleryFiles.forEach(file => fd.append('gallery_images[]', file));

    return fd;
  }

  save(): void {
    if (this.form.invalid || this.viewOnly) return;
    const formData = this.buildFormData();

    if (this.isEdit && this.tourId) {
      this.service.update(this.tourId, formData).subscribe(result => {
        if (result) {
          this.notify.success('Tour updated successfully');
          this.router.navigate(['/tours']);
        }
      });
    } else {
      this.service.create(formData).subscribe(result => {
        if (result) {
          this.notify.success('Tour created successfully');
          this.router.navigate(['/tours']);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/tours']);
  }
}
