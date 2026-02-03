import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContactDetailService } from '../contact-detail.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-contact-details-form',
  templateUrl: './contact-details-form.component.html',
  styleUrls: ['./contact-details-form.component.scss'],
  standalone: false
})
export class ContactDetailsFormComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  form!: FormGroup;
  loading = true;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private service = inject(ContactDetailService);
  private notify = inject(NotificationService);

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Travel Insolite' },
      { label: 'Settings' },
      { label: 'Contact Details', active: true }
    ];

    this.form = this.fb.group({
      email: ['', [Validators.maxLength(255), Validators.email]],
      phone: ['', Validators.maxLength(100)],
      address: [''],
      mapEmbed: [''],
      facebookUrl: ['', Validators.maxLength(500)],
      twitterUrl: ['', Validators.maxLength(500)],
      instagramUrl: ['', Validators.maxLength(500)],
      linkedinUrl: ['', Validators.maxLength(500)]
    });

    this.service.get().subscribe(data => {
      this.loading = false;
      if (data) {
        this.form.patchValue({
          email: data.email,
          phone: data.phone,
          address: data.address,
          mapEmbed: data.mapEmbed,
          facebookUrl: data.facebookUrl,
          twitterUrl: data.twitterUrl,
          instagramUrl: data.instagramUrl,
          linkedinUrl: data.linkedinUrl
        });
      }
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.service.update({
      email: value.email,
      phone: value.phone,
      address: value.address,
      mapEmbed: value.mapEmbed,
      facebookUrl: value.facebookUrl,
      twitterUrl: value.twitterUrl,
      instagramUrl: value.instagramUrl,
      linkedinUrl: value.linkedinUrl
    }).subscribe(result => {
      if (result) {
        this.notify.success('Contact details updated successfully');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}
