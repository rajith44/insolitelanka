import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tour } from './tour.model';
import { TourCategoriesService } from '../tour-categories/tour-categories.service';
import { DestinationsService } from '../destinations/destinations.service';
import { HotelsService } from '../hotels/hotels.service';

const API = environment.apiUrl ?? '';

function mapApiToTour(t: any): Tour {
  return {
    id: String(t.id),
    categoryIds: t.categoryIds ?? t.category_ids ?? [],
    title: t.title ?? '',
    slug: t.slug ?? '',
    shortTitle: t.shortTitle ?? t.short_title ?? '',
    description: t.description ?? '',
    mainImageUrl: t.mainImageUrl ?? t.main_image_url ?? '',
    main_media_id: t.main_media_id,
    imageUrls: t.imageUrls ?? t.image_urls ?? [],
    gallery_media_ids: t.gallery_media_ids ?? [],
    pricePerPerson: Number(t.pricePerPerson ?? t.price_per_person) ?? 0,
    duration: t.duration ?? '',
    maxPeople: Number(t.maxPeople ?? t.max_people) ?? 0,
    countryId: t.countryId ?? t.country_id ?? '',
    included: t.included ?? '',
    excluded: t.excluded ?? '',
    highlights: t.highlights ?? '',
    mapEmbed: t.mapEmbed ?? t.map_embed ?? '',
    videoUrl: t.videoUrl ?? t.video_url ?? '',
    itinerary: t.itinerary ?? [],
    faq: t.faq ?? [],
    extraServices: t.extraServices ?? t.extra_services ?? [],
    createdAt: t.createdAt ?? t.created_at,
    updatedAt: t.updatedAt ?? t.updated_at
  };
}

@Injectable({
  providedIn: 'root'
})
export class ToursService {
  private tours: Tour[] = [];
  private tourCategoriesService = inject(TourCategoriesService);
  private destinationsService = inject(DestinationsService);
  private hotelsService = inject(HotelsService);

  constructor(private http: HttpClient) {}

  getCategoriesForSelect(): Observable<{ id: string; title: string }[]> {
    return this.tourCategoriesService.getAll().pipe(
      map(categories => categories.map(c => ({ id: c.id, title: c.title })))
    );
  }

  getDestinationsForSelect(): Observable<{ id: string; title: string }[]> {
    return this.destinationsService.getAll().pipe(
      map(destinations => destinations.map((d: { id: string; title: string }) => ({ id: d.id, title: d.title })))
    );
  }

  getHotelsForSelect(): Observable<{ id: string; name: string }[]> {
    return this.hotelsService.getHotelsForSelect();
  }

  getCountries(): { id: string; name: string }[] {
    return this.destinationsService.getCountries();
  }

  /**
   * Single API call for tour form init (add or edit).
   * Returns categories, destinations, hotels, and optionally tour when tourId provided.
   */
  getEditData(tourId?: string | null): Observable<{
    categories: { id: string; title: string }[];
    destinations: { id: string; title: string }[];
    hotels: { id: string; name: string }[];
    tour?: Tour;
  }> {
    if (!API) {
      return of({
        categories: [],
        destinations: [],
        hotels: [],
        ...(tourId ? { tour: undefined } : {})
      });
    }
    interface EditDataResponse {
      categories?: { id: number | string; title: string }[];
      destinations?: { id: number | string; title: string }[];
      hotels?: { id: number | string; name: string }[];
      tour?: any;
    }
    const url = `${API}/tours/edit-data`;
    const request = tourId
      ? this.http.get<EditDataResponse>(url, { params: new HttpParams().set('tour_id', tourId) })
      : this.http.get<EditDataResponse>(url);
    return request.pipe(
      map((res) => ({
        categories: (res.categories ?? []).map((c) => ({ id: String(c.id), title: c.title ?? '' })),
        destinations: (res.destinations ?? []).map((d) => ({ id: String(d.id), title: d.title ?? '' })),
        hotels: (res.hotels ?? []).map((h) => ({ id: String(h.id), name: h.name ?? '' })),
        tour: res.tour ? this.enrichTour(mapApiToTour(res.tour)) : undefined
      })),
      catchError(() => of({ categories: [], destinations: [], hotels: [] }))
    );
  }

  getAll(): Observable<Tour[]> {
    if (!API) {
      return of(this.tours.map(t => this.enrichTour(t)));
    }
    return this.http.get<any[]>(`${API}/tours`).pipe(
      map(list => (list ?? []).map(mapApiToTour).map(t => this.enrichTour(t))),
      catchError(() => of(this.tours.map(t => this.enrichTour(t))))
    );
  }

  getById(id: string): Observable<Tour | undefined> {
    if (!API) {
      const t = this.tours.find(x => x.id === id);
      return of(t ? this.enrichTour(t) : undefined);
    }
    return this.http.get<any>(`${API}/tours/${id}`).pipe(
      map(t => this.enrichTour(mapApiToTour(t))),
      catchError(() => of(undefined))
    );
  }

  create(formData: FormData): Observable<Tour | null> {
    if (!API) {
      const title = formData.get('title') as string;
      const now = new Date().toISOString();
      const newTour: Tour = {
        id: String(Date.now()),
        categoryIds: JSON.parse((formData.get('category_ids') as string) || '[]'),
        title: title ?? '',
        slug: (formData.get('slug') as string) ?? '',
        shortTitle: (formData.get('short_title') as string) ?? '',
        description: (formData.get('description') as string) ?? '',
        mainImageUrl: '',
        imageUrls: [],
        pricePerPerson: Number(formData.get('price_per_person')) || 0,
        duration: (formData.get('duration') as string) ?? '',
        maxPeople: Number(formData.get('max_people')) || 0,
        countryId: (formData.get('country_id') as string) ?? '',
        included: (formData.get('included') as string) ?? '',
        excluded: (formData.get('excluded') as string) ?? '',
        highlights: (formData.get('highlights') as string) ?? '',
        mapEmbed: (formData.get('map_embed') as string) ?? '',
        videoUrl: (formData.get('video_url') as string) ?? '',
        itinerary: JSON.parse((formData.get('itinerary') as string) || '[]'),
        faq: JSON.parse((formData.get('faq') as string) || '[]'),
        extraServices: JSON.parse((formData.get('extra_services') as string) || '[]'),
        createdAt: now,
        updatedAt: now
      };
      this.tours.push(newTour);
      return of(this.enrichTour(newTour));
    }
    return this.http.post<any>(`${API}/tours`, formData).pipe(
      map(t => this.enrichTour(mapApiToTour(t))),
      catchError(() => of(null))
    );
  }

  update(id: string, formData: FormData): Observable<Tour | null> {
    if (!API) {
      const index = this.tours.findIndex(x => x.id === id);
      if (index === -1) return of(null);
      const existing = this.tours[index];
      this.tours[index] = {
        ...existing,
        title: (formData.get('title') as string) ?? existing.title,
        slug: (formData.get('slug') as string) ?? existing.slug,
        shortTitle: (formData.get('short_title') as string) ?? existing.shortTitle,
        description: (formData.get('description') as string) ?? existing.description,
        pricePerPerson: Number(formData.get('price_per_person')) ?? existing.pricePerPerson,
        duration: (formData.get('duration') as string) ?? existing.duration,
        maxPeople: Number(formData.get('max_people')) ?? existing.maxPeople,
        countryId: (formData.get('country_id') as string) ?? existing.countryId,
        included: (formData.get('included') as string) ?? existing.included,
        excluded: (formData.get('excluded') as string) ?? existing.excluded,
        highlights: (formData.get('highlights') as string) ?? existing.highlights,
        mapEmbed: (formData.get('map_embed') as string) ?? existing.mapEmbed,
        videoUrl: (formData.get('video_url') as string) ?? existing.videoUrl,
        categoryIds: JSON.parse((formData.get('category_ids') as string) || '[]') as string[],
        itinerary: JSON.parse((formData.get('itinerary') as string) || '[]'),
        faq: JSON.parse((formData.get('faq') as string) || '[]'),
        extraServices: JSON.parse((formData.get('extra_services') as string) || '[]'),
        updatedAt: new Date().toISOString()
      };
      return of(this.enrichTour(this.tours[index]));
    }
    return this.http.post<any>(`${API}/tours/${id}`, formData).pipe(
      map(t => this.enrichTour(mapApiToTour(t))),
      catchError(() => of(null))
    );
  }

  delete(id: string): Observable<boolean> {
    if (!API) {
      const index = this.tours.findIndex(x => x.id === id);
      if (index === -1) return of(false);
      this.tours.splice(index, 1);
      return of(true);
    }
    return this.http.delete(`${API}/tours/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  private enrichTour(t: Tour): Tour {
    const categories = this.tourCategoriesService.getCategoriesSync();
    const countries = this.destinationsService.getCountries();
    return {
      ...t,
      categoryNames: (t.categoryIds || []).map(cid => categories.find(c => c.id === cid)?.title).filter(Boolean) as string[],
      countryName: countries.find(c => c.id === t.countryId)?.name ?? t.countryName
    };
  }
}
