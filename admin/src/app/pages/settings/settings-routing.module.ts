import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageSliderListComponent } from './home-page-slider-list/home-page-slider-list.component';
import { HomePageSliderFormComponent } from './home-page-slider-form/home-page-slider-form.component';
import { ContactDetailsFormComponent } from './contact-details-form/contact-details-form.component';
import { GalleryListComponent } from './gallery-list/gallery-list.component';
import { ContactSubmissionsListComponent } from './contact-submissions-list/contact-submissions-list.component';
import { NewsletterListComponent } from './newsletter-list/newsletter-list.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home-page-slider' },
  {
    path: 'home-page-slider',
    children: [
      { path: '', component: HomePageSliderListComponent },
      { path: 'add', component: HomePageSliderFormComponent },
      { path: 'edit/:id', component: HomePageSliderFormComponent },
      { path: 'view/:id', component: HomePageSliderFormComponent, data: { viewOnly: true } }
    ]
  },
  { path: 'gallery', component: GalleryListComponent },
  { path: 'contact-details', component: ContactDetailsFormComponent },
  { path: 'contact-submissions', component: ContactSubmissionsListComponent },
  { path: 'newsletter', component: NewsletterListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
