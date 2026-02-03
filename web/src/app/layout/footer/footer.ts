import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NewsletterService } from '../../services/newsletter.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  private fb = inject(FormBuilder);
  private newsletterService = inject(NewsletterService);
  private cdr = inject(ChangeDetectorRef);

  newsletterForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });
  newsletterSubmitting = false;
  newsletterSuccessMessage: string | null = null;
  newsletterErrorMessage: string | null = null;

  onSubmitNewsletter(): void {
    this.newsletterSuccessMessage = null;
    this.newsletterErrorMessage = null;
    if (this.newsletterForm.invalid) {
      this.newsletterForm.markAllAsTouched();
      return;
    }
    const email = (this.newsletterForm.get('email')?.value ?? '').trim().toLowerCase();
    this.newsletterSubmitting = true;
    this.newsletterService.subscribe(email).subscribe({
      next: res => {
        this.newsletterSubmitting = false;
        if (res?.message) {
          this.newsletterSuccessMessage = res.message;
          this.newsletterForm.reset();
          this.cdr.detectChanges();
        } else {
          this.newsletterErrorMessage = 'Something went wrong. Please try again.';
        }
      },
      error: err => {
        this.newsletterSubmitting = false;
        this.newsletterErrorMessage = err?.error?.message ?? 'Something went wrong. Please try again.';
        if (err?.status === 429) this.newsletterErrorMessage = 'Too many attempts. Please try again in a minute.';
        this.cdr.detectChanges();
      },
    });
  }
}
