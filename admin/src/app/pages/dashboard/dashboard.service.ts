import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl ?? '';

export interface DashboardStats {
  tours: number;
  tourCategories: number;
  destinations: number;
  hotels: number;
  contactSubmissions: number;
  newsletterSubscribers: number;
  galleryPhotos: number;
  homePageSliders: number;
}

export interface RecentContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentContactSubmissions: RecentContactSubmission[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardData | null> {
    if (!API) return of(null);
    return this.http.get<any>(`${API}/dashboard`).pipe(
      map(res => {
        if (!res) return null;
        const stats = res.stats ?? {};
        const recent = (res.recentContactSubmissions ?? []).map((r: any) => ({
          id: String(r.id ?? ''),
          name: r.name ?? '',
          email: r.email ?? '',
          message: r.message ?? '',
          createdAt: r.createdAt ?? r.created_at ?? ''
        }));
        return {
          stats: {
            tours: Number(stats.tours ?? 0),
            tourCategories: Number(stats.tourCategories ?? stats.tour_categories ?? 0),
            destinations: Number(stats.destinations ?? 0),
            hotels: Number(stats.hotels ?? 0),
            contactSubmissions: Number(stats.contactSubmissions ?? stats.contact_submissions ?? 0),
            newsletterSubscribers: Number(stats.newsletterSubscribers ?? stats.newsletter_subscribers ?? 0),
            galleryPhotos: Number(stats.galleryPhotos ?? stats.gallery_photos ?? 0),
            homePageSliders: Number(stats.homePageSliders ?? stats.home_page_sliders ?? 0)
          },
          recentContactSubmissions: recent
        };
      }),
      catchError(() => of(null))
    );
  }
}
