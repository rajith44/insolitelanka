import { AfterViewInit, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactService, ContactFormPayload } from '../../services/contact.service';
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
  selector: 'app-contact-us',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.scss',
})
export class ContactUs implements AfterViewInit {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.maxLength(50)]],
    message: ['', [Validators.required, Validators.maxLength(5000)]],
    website_url: [''], // Honeypot: must stay empty
  });

  submitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  recaptchaSiteKey = environment.recaptchaSiteKey ?? '';
  recaptchaWidgetId: number | null = null;

  ngAfterViewInit(): void {
    if (!this.recaptchaSiteKey || typeof window === 'undefined') return;
    const onLoad = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          const el = document.getElementById('recaptcha-container');
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
    (window as unknown as { onRecaptchaContactLoad?: () => void }).onRecaptchaContactLoad = onLoad;
    if (!document.querySelector('script[src*="recaptcha/api.js"]')) {
      const s = document.createElement('script');
      s.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaContactLoad&render=explicit`;
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }
  }

  onSubmit(): void {
    this.successMessage = null;
    this.errorMessage = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Honeypot: if filled, treat as bot (don't submit)
    if (this.form.get('website_url')?.value?.trim()) {
      this.successMessage = 'Thank you! We will get back to you soon.';
      return;
    }
    this.submitting = true;
    const payload: ContactFormPayload = {
      name: this.form.get('name')?.value?.trim() ?? '',
      email: this.form.get('email')?.value?.trim() ?? '',
      phone: (this.form.get('phone')?.value as string)?.trim() || undefined,
      message: this.form.get('message')?.value?.trim() ?? '',
      website_url: (this.form.get('website_url')?.value as string)?.trim() || undefined,
    };
    if (this.recaptchaSiteKey && window.grecaptcha && this.recaptchaWidgetId !== null) {
      const token = window.grecaptcha.getResponse(this.recaptchaWidgetId);
      if (!token) {
        this.errorMessage = 'Please complete the security check.';
        this.submitting = false;
        return;
      }
      payload['recaptcha_token'] = token;
    }
    this.contactService.submitForm(payload).subscribe({
      next: res => {
        this.submitting = false;
        if (res) {
          this.successMessage = res.message || 'Thank you! We will get back to you soon.';
          this.form.reset();
          this.form.patchValue({ website_url: '' });
          if (this.recaptchaSiteKey && window.grecaptcha && this.recaptchaWidgetId !== null) {
            window.grecaptcha.reset(this.recaptchaWidgetId);
          }
        } else {
          this.errorMessage = 'Something went wrong. Please try again.';
        }
      },
      error: err => {
        this.submitting = false;
        const msg = err?.error?.message;
        this.errorMessage = msg || 'Something went wrong. Please try again.';
        if (err?.status === 429) {
          this.errorMessage = 'Too many attempts. Please try again in a minute.';
        }
      },
    });
  }
}
