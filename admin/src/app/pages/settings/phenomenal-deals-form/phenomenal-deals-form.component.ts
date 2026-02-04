import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PhenomenalDealsService } from '../phenomenal-deals.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MediaPickerService } from '../../../core/services/media-picker.service';

const CARD_KEYS = ['card1', 'card2', 'card3', 'card4'] as const;

@Component({
  selector: 'app-phenomenal-deals-form',
  templateUrl: './phenomenal-deals-form.component.html',
  styleUrls: ['./phenomenal-deals-form.component.scss'],
  standalone: false,
})
export class PhenomenalDealsFormComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  form!: FormGroup;
  loading = true;

  /** Per-card: new file selected for upload */
  cardFiles: { [k: string]: File | null } = { card1: null, card2: null, card3: null, card4: null };
  /** Per-card: existing media ID when selected from library */
  cardMediaIds: { [k: string]: number | null } = { card1: null, card2: null, card3: null, card4: null };

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private service = inject(PhenomenalDealsService);
  private notify = inject(NotificationService);
  private mediaPicker = inject(MediaPickerService);

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Travel Insolite' },
      { label: 'Settings' },
      { label: 'Phenomenal Deals', active: true },
    ];

    this.form = this.fb.group({
      sectionBadge: ['', Validators.maxLength(200)],
      sectionHeading: ['', Validators.maxLength(200)],
      card1: this.fb.group({
        imageUrl: [''],
        label: ['', Validators.maxLength(200)],
        title: ['', Validators.maxLength(200)],
        subtitle: ['', Validators.maxLength(500)],
        linkUrl: ['', Validators.maxLength(500)],
        linkText: ['', Validators.maxLength(200)],
        offerBadge: ['', Validators.maxLength(100)],
      }),
      card2: this.fb.group({
        imageUrl: [''],
        label: ['', Validators.maxLength(200)],
        title: ['', Validators.maxLength(200)],
        subtitle: ['', Validators.maxLength(500)],
        linkUrl: ['', Validators.maxLength(500)],
        linkText: ['', Validators.maxLength(200)],
        offerBadge: ['', Validators.maxLength(100)],
      }),
      card3: this.fb.group({
        imageUrl: [''],
        label: ['', Validators.maxLength(200)],
        title: ['', Validators.maxLength(200)],
        subtitle: ['', Validators.maxLength(500)],
        linkUrl: ['', Validators.maxLength(500)],
        linkText: ['', Validators.maxLength(200)],
        offerBadge: ['', Validators.maxLength(100)],
      }),
      card4: this.fb.group({
        imageUrl: [''],
        label: ['', Validators.maxLength(200)],
        title: ['', Validators.maxLength(200)],
        subtitle: ['', Validators.maxLength(500)],
        linkUrl: ['', Validators.maxLength(500)],
        linkText: ['', Validators.maxLength(200)],
        offerBadge: ['', Validators.maxLength(100)],
      }),
    });

    this.service.get().subscribe((data) => {
      this.loading = false;
      if (data) {
        this.form.patchValue({
          sectionBadge: data.sectionBadge,
          sectionHeading: data.sectionHeading,
          card1: data.card1,
          card2: data.card2,
          card3: data.card3,
          card4: data.card4,
        });
        CARD_KEYS.forEach((key) => {
          this.cardFiles[key] = null;
          this.cardMediaIds[key] = null;
        });
      }
    });
  }

  cardGroup(key: string): FormGroup {
    return this.form.get(key) as FormGroup;
  }

  onCardImageChange(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.cardFiles[key] = file;
      this.cardMediaIds[key] = null;
      const reader = new FileReader();
      reader.onload = () => this.cardGroup(key).patchValue({ imageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  openMediaPicker(key: string): void {
    this.mediaPicker.openSingleImage().then((item) => {
      if (item?.url) {
        this.cardFiles[key] = null;
        this.cardMediaIds[key] = item.id;
        this.cardGroup(key).patchValue({ imageUrl: item.url });
      }
    });
  }

  buildFormData(): FormData {
    const v = this.form.getRawValue();
    const fd = new FormData();
    fd.append('section_badge', v.sectionBadge ?? '');
    fd.append('section_heading', v.sectionHeading ?? '');

    CARD_KEYS.forEach((key) => {
      const card = v[key] ?? {};
      fd.append(`${key}_label`, card.label ?? '');
      fd.append(`${key}_title`, card.title ?? '');
      fd.append(`${key}_subtitle`, card.subtitle ?? '');
      fd.append(`${key}_link_url`, card.linkUrl ?? '');
      fd.append(`${key}_link_text`, card.linkText ?? '');
      fd.append(`${key}_offer_badge`, card.offerBadge ?? '');

      if (this.cardFiles[key]) {
        fd.append(`${key}_image`, this.cardFiles[key] as File);
      } else if (this.cardMediaIds[key] != null) {
        fd.append(`${key}_media_id`, String(this.cardMediaIds[key]));
      }
    });

    return fd;
  }

  save(): void {
    if (this.form.invalid) return;
    const formData = this.buildFormData();
    this.service.update(formData).subscribe((result) => {
      if (result) {
        this.notify.success('Phenomenal Deals updated successfully');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}
