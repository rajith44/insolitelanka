import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { TourDetails } from './pages/tour-details/tour-details';
import { ContactUs } from './pages/contact-us/contact-us';
import { Gallery } from './pages/gallery/gallery';
import { Destination } from './pages/destination/destination';
import { Tours } from './pages/tours/tours';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },
  { path: 'about', component: About },
  { path: 'tours', component: Tours },
  { path: 'tours/:slug', component: Tours },
  { path: 'tour-details', component: TourDetails },
  { path: 'tour-details/:slug', component: TourDetails },
  { path: 'contact-us', component: ContactUs },
  { path: 'gallery', component: Gallery },
  { path: 'destination', component: Destination },
  { path: 'destination/:countrySlug', component: Destination },
  { path: 'destination/:placeSlug', component: Destination },
  { path: '**', redirectTo: '' },
];