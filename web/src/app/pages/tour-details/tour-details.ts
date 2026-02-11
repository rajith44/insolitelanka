import { AfterViewInit, Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TourService, TourDetail, TourDestination, TourHotel, TourExtraService } from '../../services/tour.service';
import { ContactService, ContactFormPayload } from '../../services/contact.service';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      getResponse: (widgetId?: number) => string;
      reset: (widgetId?: number) => void;
      render: (container: string | HTMLElement, options: { sitekey: string; theme?: string }) => number;
    };
  }
}

@Component({
  selector: 'app-tour-details',
  imports: [RouterLink, DecimalPipe, SafeHtmlPipe, ReactiveFormsModule],
  templateUrl: './tour-details.html',
  styleUrl: './tour-details.scss',
})
export class TourDetails implements OnInit, AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private tourService = inject(TourService);
  private contactService = inject(ContactService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  tour: TourDetail | null = null;
  /** True when user has scrolled to the itinerary section; shows sticky bottom bar */
  showStickyBar = false;
  private itineraryObserver: IntersectionObserver | null = null;
  loading = true;
  notFound = false;
  selectedDestination: TourDestination | null = null;
  selectedHotel: TourHotel | null = null;

  inquiryForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.maxLength(50)]],
    message: ['', [Validators.required, Validators.maxLength(5000)]],
    website_url: [''], // Honeypot
  });
  inquirySubmitting = false;
  inquirySuccessMessage: string | null = null;
  inquiryErrorMessage: string | null = null;
  recaptchaSiteKey = environment.recaptchaSiteKey ?? '';
  recaptchaWidgetId: number | null = null;

  /** Booking form; built when tour is loaded (includes extraServices FormArray). */
  bookingForm: FormGroup | null = null;
  bookingSubmitting = false;
  bookingSuccessMessage: string | null = null;
  bookingErrorMessage: string | null = null;

  openDestinationModal(dest: TourDestination): void {
    this.selectedDestination = dest;
    this.cdr.detectChanges();
    document.body.classList.add('modal-open');
  }

  closeDestinationModal(): void {
    this.selectedDestination = null;
    this.cdr.detectChanges();
    document.body.classList.remove('modal-open');
  }

  openHotelModal(hotel: TourHotel): void {
    this.selectedHotel = hotel;
    this.cdr.detectChanges();
    document.body.classList.add('modal-open');
  }

  closeHotelModal(): void {
    this.selectedHotel = null;
    this.cdr.detectChanges();
    document.body.classList.remove('modal-open');
  }

  getStarArray(star: number | string | null): number[] {
    const n = star != null ? Math.min(5, Math.max(0, Number(star))) : 0;
    return Array(n).fill(0);
  }

  getShortDescription(html: string, maxLen: number = 80): string {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.length <= maxLen ? text : text.slice(0, maxLen) + '…';
  }

  /** Join array for display: optional property (e.g. 'name' for hotels) or raw strings */
  joinMeta(arr: unknown[] | null | undefined, prop?: string): string {
    if (!arr || !arr.length) return '';
    const parts = prop
      ? (arr as Record<string, unknown>[]).map((x) => x?.[prop]).filter((v) => v != null).map(String)
      : (arr as unknown[]).map((x) => (x != null ? String(x) : '')).filter(Boolean);
    return parts.join(', ');
  }

  private buildBookingForm(tour: TourDetail): void {
    const maxPeople = Math.max(1, tour.maxPeople || 99);
    this.bookingForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.maxLength(50)]],
      bookingDate: ['', Validators.required],
      adults: [1, [Validators.required, Validators.min(1), Validators.max(maxPeople)]],
      children: [0, [Validators.required, Validators.min(0), Validators.max(99)]],
      extraServices: this.fb.array(tour.extraServices.map(() => this.fb.control(false))),
    });
  }

  get bookingExtraControls(): FormArray {
    return this.bookingForm?.get('extraServices') as FormArray;
  }

  bookingIncrementAdults(): void {
    const c = this.bookingForm?.get('adults');
    if (!c || !this.tour) return;
    const max = Math.max(1, this.tour.maxPeople || 99);
    const v = Math.min(max, (c.value ?? 1) + 1);
    c.setValue(v);
  }

  bookingDecrementAdults(): void {
    const c = this.bookingForm?.get('adults');
    if (!c) return;
    const v = Math.max(1, (c.value ?? 1) - 1);
    c.setValue(v);
  }

  bookingIncrementChildren(): void {
    const c = this.bookingForm?.get('children');
    if (!c) return;
    const v = Math.min(99, (c.value ?? 0) + 1);
    c.setValue(v);
  }

  bookingDecrementChildren(): void {
    const c = this.bookingForm?.get('children');
    if (!c) return;
    const v = Math.max(0, (c.value ?? 0) - 1);
    c.setValue(v);
  }

  /** Adult subtotal: adults × pricePerPerson (full rate). */
  getBookingAdultSubtotal(): number {
    if (!this.tour || !this.bookingForm) return 0;
    const adults = Number(this.bookingForm.get('adults')?.value ?? 0);
    return adults * this.tour.pricePerPerson;
  }

  /** Children subtotal: children × (pricePerPerson × 0.5). */
  getBookingChildrenSubtotal(): number {
    if (!this.tour || !this.bookingForm) return 0;
    const children = Number(this.bookingForm.get('children')?.value ?? 0);
    return children * (this.tour.pricePerPerson * 0.5);
  }

  /** Extras subtotal: for each selected extra, adults × price + children × (price × 0.5). */
  getBookingExtrasSubtotal(): number {
    if (!this.tour || !this.bookingForm) return 0;
    const arr = this.bookingForm.get('extraServices') as FormArray;
    if (!arr || !Array.isArray(this.tour.extraServices)) return 0;
    const adults = Number(this.bookingForm.get('adults')?.value ?? 0);
    const children = Number(this.bookingForm.get('children')?.value ?? 0);
    let sum = 0;
    this.tour.extraServices.forEach((extra: TourExtraService, i: number) => {
      const selected = arr.at(i)?.value === true;
      if (selected && extra.pricePerPerson != null) {
        sum += adults * extra.pricePerPerson + children * (extra.pricePerPerson * 0.5);
      }
    });
    return sum;
  }

  getBookingTotal(): number {
    return this.getBookingAdultSubtotal() + this.getBookingChildrenSubtotal() + this.getBookingExtrasSubtotal();
  }

  onSubmitBooking(): void {
    this.bookingSuccessMessage = null;
    this.bookingErrorMessage = null;
    if (!this.bookingForm || !this.tour || this.bookingForm.invalid) {
      this.bookingForm?.markAllAsTouched();
      return;
    }
    const name = (this.bookingForm.get('name')?.value ?? '').trim();
    const email = (this.bookingForm.get('email')?.value ?? '').trim();
    const phone = (this.bookingForm.get('phone')?.value as string)?.trim() || undefined;
    const bookingDate = (this.bookingForm.get('bookingDate')?.value ?? '').trim();
    const adults = Number(this.bookingForm.get('adults')?.value ?? 0);
    const children = Number(this.bookingForm.get('children')?.value ?? 0);
    const arr = this.bookingForm.get('extraServices') as FormArray;
    const selectedExtras: { title: string; pricePerPerson: number }[] = [];
    if (arr && Array.isArray(this.tour.extraServices)) {
      this.tour.extraServices.forEach((extra: TourExtraService, i: number) => {
        if (arr.at(i)?.value === true) selectedExtras.push({ title: extra.title, pricePerPerson: extra.pricePerPerson });
      });
    }
    const adultSub = this.getBookingAdultSubtotal();
    const childSub = this.getBookingChildrenSubtotal();
    const extrasSub = this.getBookingExtrasSubtotal();
    const total = this.getBookingTotal();
    let message = `BOOKING REQUEST\n\nTour: ${this.tour.title}\nPreferred date: ${bookingDate || 'Not specified'}\nAdults: ${adults}\nChildren: ${children}\n\n`;
    if (selectedExtras.length) {
      message += 'Extra services: ' + selectedExtras.map(e => `${e.title} ($${e.pricePerPerson}/person)`).join(', ') + '\n\n';
    }
    message += `Subtotal (adults): $${adultSub.toFixed(2)}\nSubtotal (children 50%): $${childSub.toFixed(2)}\nExtras: $${extrasSub.toFixed(2)}\nTotal: $${total.toFixed(2)}`;
    this.bookingSubmitting = true;
    const payload: ContactFormPayload = { name, email, message, phone };
    this.contactService.submitForm(payload).subscribe({
      next: res => {
        this.bookingSubmitting = false;
        if (res) {
          this.bookingSuccessMessage = res.message || 'Thank you! Your booking request has been sent.';
          this.bookingForm?.patchValue({ name: '', email: '', phone: '', bookingDate: '', adults: 1, children: 0 });
          const arr = this.bookingForm?.get('extraServices') as FormArray;
          arr?.controls?.forEach(c => c.setValue(false));
          this.cdr.detectChanges();
        } else {
          this.bookingErrorMessage = 'Something went wrong. Please try again.';
        }
      },
      error: err => {
        this.bookingSubmitting = false;
        this.bookingErrorMessage = err?.error?.message || 'Something went wrong. Please try again.';
        if (err?.status === 429) this.bookingErrorMessage = 'Too many attempts. Please try again in a minute.';
        this.cdr.detectChanges();
      },
    });
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.loading = false;
      this.notFound = true;
      this.cdr.detectChanges();
      return;
    }
    this.tourService.getBySlug(slug).subscribe({
      next: (t) => {
        this.loading = false;
        this.tour = t ?? null;
        this.notFound = !t;
        if (t) this.buildBookingForm(t);
        this.cdr.detectChanges();
        if (t) setTimeout(() => this.setupItineraryObserver(), 0);
      },
      error: () => {
        this.loading = false;
        this.tour = null;
        this.notFound = true;
        this.cdr.detectChanges();
      },
    });
  }

  private setupItineraryObserver(): void {
    if (typeof document === 'undefined') return;
    const el = document.getElementById('tour-itinerary-area');
    if (!el || this.itineraryObserver) return;
    this.itineraryObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          const show = entry.isIntersecting;
          setTimeout(() => {
            this.showStickyBar = show;
            this.cdr.detectChanges();
          }, 0);
        }
      },
      { threshold: 0.1, rootMargin: '0px' }
    );
    this.itineraryObserver.observe(el);
  }

  /** Scroll to the booking/inquiry sidebar (used by sticky bar CTA). */
  scrollToBooking(): void {
    if (typeof document === 'undefined') return;
    document.getElementById('tour-booking-sidebar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  ngAfterViewInit(): void {
    if (!this.recaptchaSiteKey || typeof window === 'undefined') return;
    const onLoad = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          const el = document.getElementById('tour-inquiry-recaptcha');
          if (el) {
            this.recaptchaWidgetId = window.grecaptcha!.render(el, { sitekey: this.recaptchaSiteKey, theme: 'light' });
          }
        });
      }
    };
    if (window.grecaptcha) {
      onLoad();
      return;
    }
    (window as unknown as { onRecaptchaTourInquiryLoad?: () => void }).onRecaptchaTourInquiryLoad = onLoad;
    if (!document.querySelector('script[src*="recaptcha/api.js"]')) {
      const s = document.createElement('script');
      s.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaTourInquiryLoad&render=explicit';
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }
  }

  onSubmitInquiry(): void {
    this.inquirySuccessMessage = null;
    this.inquiryErrorMessage = null;
    if (this.inquiryForm.invalid) {
      this.inquiryForm.markAllAsTouched();
      return;
    }
    if (this.inquiryForm.get('website_url')?.value?.trim()) {
      this.inquirySuccessMessage = 'Thank you! We will get back to you soon.';
      return;
    }
    this.inquirySubmitting = true;
    let message = this.inquiryForm.get('message')?.value?.trim() ?? '';
    if (this.tour?.title) {
      message = `Inquiry about: ${this.tour.title}\n\n${message}`;
    }
    const payload: ContactFormPayload = {
      name: this.inquiryForm.get('name')?.value?.trim() ?? '',
      email: this.inquiryForm.get('email')?.value?.trim() ?? '',
      phone: (this.inquiryForm.get('phone')?.value as string)?.trim() || undefined,
      message,
      website_url: (this.inquiryForm.get('website_url')?.value as string)?.trim() || undefined,
    };
    if (this.recaptchaSiteKey && window.grecaptcha && this.recaptchaWidgetId !== null) {
      const token = window.grecaptcha.getResponse(this.recaptchaWidgetId);
      if (!token) {
        this.inquiryErrorMessage = 'Please complete the security check.';
        this.inquirySubmitting = false;
        return;
      }
      payload['recaptcha_token'] = token;
    }
    this.contactService.submitForm(payload).subscribe({
      next: res => {
        this.inquirySubmitting = false;
        if (res) {
          this.inquirySuccessMessage = res.message || 'Thank you! We will get back to you soon.';
          this.inquiryForm.reset();
          this.inquiryForm.patchValue({ website_url: '' });
          if (this.recaptchaSiteKey && window.grecaptcha && this.recaptchaWidgetId !== null) {
            window.grecaptcha.reset(this.recaptchaWidgetId);
          }
          this.cdr.detectChanges();
        } else {
          this.inquiryErrorMessage = 'Something went wrong. Please try again.';
        }
      },
      error: err => {
        this.inquirySubmitting = false;
        this.inquiryErrorMessage = err?.error?.message || 'Something went wrong. Please try again.';
        if (err?.status === 429) this.inquiryErrorMessage = 'Too many attempts. Please try again in a minute.';
        this.cdr.detectChanges();
      },
    });
  }

  ngOnDestroy(): void {
    this.itineraryObserver?.disconnect();
    this.itineraryObserver = null;
  }
}
