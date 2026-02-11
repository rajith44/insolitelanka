import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TourItineraryItem {
  day?: string | number;
  mainTitle?: string;
  title?: string;
  day_highlights?: any[];
  day_activities?: any[];
  description?: string;
  content?: string;
  imageUrls?: string[];
  destinations?: TourDestination[];
  hotels?: TourHotel[];
  fromCity?: string;
  toCity?: string;
  travelMileageKm?: number;
  walkingTime?: string;
  mealsIncluded?: string[];
  elevationGain?: string | number;
  elevationLoss?: string | number;
  distanceCovered?: string | number;
  transfer?: string;
  activity?: string[];
  [key: string]: unknown;
}

export interface TourFaqItem {
  question?: string;
  answer?: string;
  [key: string]: unknown;
}

export interface TourHotel {
  id: string;
  name: string;
  slug: string;
  description: string;
  highlights: string;
  priceRangeMin: number | null;
  priceRangeMax: number | null;
  star: number | string | null;
  imageUrl: string | null;
  imageUrls?: any[];
}

export interface TourDestinationHighlight {
  description: string;
  imageUrl: string | null;
}

export interface TourDestination {
  id: string;
  title: string;
  slug: string;
  countryId: string;
  mainDescription: string;
  subTitle: string;
  subDescription: string;
  imageUrl: string | null;
  imageUrls?: string[];
  highlights: TourDestinationHighlight[];
}

/** Extra service from tour API (per-person price). */
export interface TourExtraService {
  id: string;
  title: string;
  pricePerPerson: number;
}

export interface TourDetail {
  id: string;
  categoryIds: string[];
  title: string;
  slug: string;
  shortTitle: string;
  description: string;
  mainImageUrl: string | null;
  imageUrls: string[];
  pricePerPerson: number;
  duration: string;
  maxPeople: number;
  countryId: string;
  included: string[];
  excluded: string[];
  highlights: string[];
  mapEmbed: string;
  videoUrl: string;
  itinerary: TourItineraryItem[];
  faq: TourFaqItem[];
  extraServices: TourExtraService[];
  hotels: TourHotel[];
  destinations: TourDestination[];
  fromCity: string;
  toCity: string;
  travelMileageKm: number;
  createdAt?: string;
  updatedAt?: string;
}

const API = environment.apiUrl ?? '';

/** List item for tours grid (same shape as home tour cards). */
export interface TourListItem {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  duration: string;
  pricePerPerson: number;
  mainImageUrl: string | null;
  categoryIds: string[];
}

function mapTourListItem(raw: any): TourListItem {
  const categoryIds = raw?.categoryIds ?? raw?.category_ids ?? [];
  return {
    id: String(raw?.id ?? ''),
    slug: raw?.slug ?? '',
    title: raw?.title ?? '',
    shortTitle: raw?.shortTitle ?? raw?.short_title ?? '',
    duration: raw?.duration ?? '',
    pricePerPerson: Number(raw?.pricePerPerson ?? raw?.price_per_person ?? 0),
    mainImageUrl: raw?.mainImageUrl ?? raw?.main_image_url ?? null,
    categoryIds: Array.isArray(categoryIds) ? categoryIds.map((id: unknown) => String(id)) : [],
  };
}

/** Result of getList when filtering by category (includes category info). */
export interface TourListResult {
  tours: TourListItem[];
  category?: { id: string; title: string; slug: string };
}

@Injectable({
  providedIn: 'root',
})
export class TourService {
  constructor(private http: HttpClient) {}

  /**
   * Get tours for list page. If categorySlug is provided, only tours in that category.
   * No pagination — returns all matching tours. When filtering by category, result includes category info.
   */
  getList(categorySlug?: string | null): Observable<TourListResult> {
    if (!API) {
      return of({ tours: [] });
    }
    const options = categorySlug ? { params: { category_slug: categorySlug } } : {};
    return this.http.get<unknown[] | { category: any; tours: unknown[] }>(`${API}/tours`, options).pipe(
      map(res => {
        if (Array.isArray(res)) {
          return { tours: (res ?? []).map((t: any) => mapTourListItem(t)) };
        }
        const data = res as { category?: any; tours?: unknown[] };
        const tours = (data?.tours ?? []).map((t: any) => mapTourListItem(t));
        const cat = data?.category;
        const category = cat
          ? { id: String(cat.id ?? ''), title: cat.title ?? '', slug: cat.slug ?? '' }
          : undefined;
        return { tours, category };
      }),
      catchError(() => of({ tours: [] }))
    );
  }

  getBySlug(slug: string): Observable<TourDetail | null> {
    if (!API || !slug) {
      return of(null);
    }
    return this.http.get<TourDetail>(`${API}/tours/slug/${encodeURIComponent(slug)}`).pipe(
      catchError(() => of(null)),
      map((t): TourDetail | null => {
        if (!t) return null;
        const rawExtras = (t as { extraServices?: unknown[] }).extraServices ?? (t as { extra_services?: unknown[] }).extra_services ?? [];
        const extraServices: TourExtraService[] = Array.isArray(rawExtras)
          ? rawExtras.map((e: any, i: number) => ({
              id: String(e?.id ?? e?.title ?? i),
              title: e?.title ?? e?.name ?? '',
              pricePerPerson: Number(e?.pricePerPerson ?? e?.price_per_person ?? 0),
            }))
          : [];
        return {
          ...t,
          itinerary: t.itinerary ?? [],
          hotels: t.hotels ?? [],
          destinations: t.destinations ?? [],
          included: Array.isArray(t.included) ? t.included : [],
          excluded: Array.isArray(t.excluded) ? t.excluded : [],
          highlights: Array.isArray(t.highlights) ? t.highlights : [],
          extraServices,
        };
      })
    );
  }
}
