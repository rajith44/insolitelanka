import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, map, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

const API = environment.apiUrl ?? '';
const LIMIT = 6;
const BUNDLES_LIMIT = 30; // fetch more tours to pick one per category

/** Response from GET /api/home (single request for home page). */
export interface HomePageData {
  sliders: Array<{ id: string; imageUrl: string; topname: string; title: string; subtitle: string; sortOrder: number }>;
  tours: HomeTourItem[];
  hotels: HomeHotelItem[];
  destinations: HomeDestinationItem[];
  bundlesTours: HomeTourItem[];
}

export interface HomeTourItem {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  duration: string;
  pricePerPerson: number;
  mainImageUrl: string | null;
  categoryIds: string[];
}

export interface HomeHotelItem {
  id: string;
  slug: string;
  name: string;
  star: number;
  priceRangeMin: number;
  priceRangeMax: number;
  mainImageUrl: string | null;
  imageUrls: string[];
}

export interface HomeDestinationItem {
  id: string;
  slug: string;
  title: string;
  mainImageUrl: string | null;
}

export interface HomeData {
  tours: HomeTourItem[];
  hotels: HomeHotelItem[];
  destinations: HomeDestinationItem[];
  /** One tour per category for Affordable Vacation Bundles section */
  bundlesTours: HomeTourItem[];
}

function mapTour(raw: any): HomeTourItem {
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

function mapHotel(raw: any): HomeHotelItem {
  return {
    id: String(raw?.id ?? ''),
    slug: raw?.slug ?? '',
    name: raw?.name ?? '',
    star: Number(raw?.star ?? 0) || 1,
    priceRangeMin: Number(raw?.priceRangeMin ?? raw?.price_range_min ?? 0),
    priceRangeMax: Number(raw?.priceRangeMax ?? raw?.price_range_max ?? 0),
    mainImageUrl: raw?.mainImageUrl ?? raw?.main_image_url ?? null,
    imageUrls: Array.isArray(raw?.imageUrls) ? raw.imageUrls : (raw?.image_urls ?? []),
  };
}

function mapDestination(raw: any): HomeDestinationItem {
  return {
    id: String(raw?.id ?? ''),
    slug: raw?.slug ?? '',
    title: raw?.title ?? '',
    mainImageUrl: raw?.mainImageUrl ?? raw?.main_image_url ?? null,
  };
}

function mapSlider(raw: any): { id: string; imageUrl: string; topname: string; title: string; subtitle: string; sortOrder: number } {
  return {
    id: String(raw?.id ?? ''),
    imageUrl: raw?.imageUrl ?? '',
    topname: raw?.topname ?? '',
    title: raw?.title ?? '',
    subtitle: raw?.subtitle ?? '',
    sortOrder: Number(raw?.sortOrder ?? raw?.sort_order ?? 0) ?? 0,
  };
}

@Injectable({
  providedIn: 'root',
})
export class HomeDataService {
  constructor(private http: HttpClient) {}

  /**
   * Single request for home page data (sliders, tours, hotels, destinations).
   * Use this instead of getSliders() + getHomeData() to avoid 429 Too Many Requests.
   */
  getHomePageData(): Observable<HomePageData> {
    if (!API) {
      return of({
        sliders: [],
        tours: [],
        hotels: [],
        destinations: [],
        bundlesTours: [],
      });
    }
    return this.http.get<{
      sliders?: unknown[];
      tours?: unknown[];
      hotels?: unknown[];
      destinations?: unknown[];
    }>(`${API}/home`).pipe(
      map(res => {
        const toursRaw = (res?.tours ?? []).map((t: any) => mapTour(t));
        const tours = toursRaw.slice(0, LIMIT);
        const allTours = toursRaw.slice(0, BUNDLES_LIMIT);
        const seenCategoryIds = new Set<string>();
        const bundlesTours: HomeTourItem[] = [];
        for (const tour of allTours) {
          const firstCategoryId = tour.categoryIds?.[0] ?? `tour-${tour.id}`;
          if (!seenCategoryIds.has(firstCategoryId)) {
            seenCategoryIds.add(firstCategoryId);
            bundlesTours.push(tour);
          }
        }
        return {
          sliders: (res?.sliders ?? []).map((s: any) => mapSlider(s)),
          tours,
          hotels: (res?.hotels ?? []).map((h: any) => mapHotel(h)),
          destinations: (res?.destinations ?? []).map((d: any) => mapDestination(d)),
          bundlesTours,
        };
      }),
      catchError(() =>
        of({
          sliders: [],
          tours: [],
          hotels: [],
          destinations: [],
          bundlesTours: [],
        })
      )
    );
  }

  getHomeData(): Observable<HomeData> {
    if (!API) {
      return of({ tours: [], hotels: [], destinations: [], bundlesTours: [] });
    }
    return forkJoin({
      toursRaw: this.http.get<unknown[]>(`${API}/tours`).pipe(
        map(list => (list ?? []).map((t: any) => mapTour(t))),
        catchError(() => of([]))
      ),
      hotels: this.http.get<unknown[]>(`${API}/hotels`).pipe(
        map(list => (list ?? []).slice(0, LIMIT).map((h: any) => mapHotel(h))),
        catchError(() => of([]))
      ),
      destinations: this.http.get<unknown[]>(`${API}/destinations`).pipe(
        map(list => (list ?? []).slice(0, LIMIT).map((d: any) => mapDestination(d))),
        catchError(() => of([]))
      ),
    }).pipe(
      map(({ toursRaw, hotels, destinations }) => {
        const tours = toursRaw.slice(0, LIMIT);
        const allTours = toursRaw.slice(0, BUNDLES_LIMIT);
        const seenCategoryIds = new Set<string>();
        const bundlesTours: HomeTourItem[] = [];
        for (const tour of allTours) {
          const firstCategoryId = tour.categoryIds?.[0] ?? `tour-${tour.id}`;
          if (!seenCategoryIds.has(firstCategoryId)) {
            seenCategoryIds.add(firstCategoryId);
            bundlesTours.push(tour);
          }
        }
        return { tours, hotels, destinations, bundlesTours };
      })
    );
  }
}
