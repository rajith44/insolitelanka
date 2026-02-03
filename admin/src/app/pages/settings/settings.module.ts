import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { SettingsRoutingModule } from './settings-routing.module';
import { HomePageSliderListComponent } from './home-page-slider-list/home-page-slider-list.component';
import { HomePageSliderFormComponent } from './home-page-slider-form/home-page-slider-form.component';
import { ContactDetailsFormComponent } from './contact-details-form/contact-details-form.component';
import { GalleryListComponent } from './gallery-list/gallery-list.component';
import { ContactSubmissionsListComponent } from './contact-submissions-list/contact-submissions-list.component';
import { NewsletterListComponent } from './newsletter-list/newsletter-list.component';

@NgModule({
  declarations: [
    HomePageSliderListComponent,
    HomePageSliderFormComponent,
    ContactDetailsFormComponent,
    GalleryListComponent,
    ContactSubmissionsListComponent,
    NewsletterListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    SettingsRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SettingsModule { }
