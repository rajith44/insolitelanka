import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, map, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

const API = environment.apiUrl ?? '';
const LIMIT = 6;
const BUNDLES_LIMIT = 30; // fetch more tours to pick one per category

/** One card in the Phenomenal Deals (banner2) section */
export interface PhenomenalDealCard {
  imageUrl: string | null;
  label: string;
  title: string;
  subtitle: string | null;
  linkUrl: string;
  linkText: string | null;
  offerBadge: string | null;
}

/** Phenomenal Deals section (banner2) - single section with 4 cards */
export interface PhenomenalDealsData {
  id: string;
  sectionBadge: string;
  sectionHeading: string;
  card1: PhenomenalDealCard;
  card2: PhenomenalDealCard;
  card3: PhenomenalDealCard;
  card4: PhenomenalDealCard;
}

/** Testimonial section title (badge + heading) */
export interface TestimonialSectionData {
  id: string;
  sectionBadge: string;
  sectionHeading: string;
}

/** Single testimonial item for home page */
export interface TestimonialItem {
  id: string;
  personName: string;
  country: string;
  date: string;
  personComment: string;
  personRating: number[];
  sortOrder: number;
}

/** Tour parent category for home page grid (id, title, slug, imageUrl). */
export interface TourParentCategoryItem {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
}

/** Response from GET /api/home (single request for home page). */
export interface HomePageData {
  sliders: Array<{ id: string; imageUrl: string; topname: string; title: string; subtitle: string; sortOrder: number }>;
  phenomenalDeals: PhenomenalDealsData | null;
  testimonialSection: TestimonialSectionData | null;
  testimonials: TestimonialItem[];
  tourParentCategories: TourParentCategoryItem[];
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

function mapDealCard(raw: any): PhenomenalDealCard {
  return {
    imageUrl: raw?.imageUrl ?? null,
    label: raw?.label ?? '',
    title: raw?.title ?? '',
    subtitle: raw?.subtitle ?? null,
    linkUrl: raw?.linkUrl ?? '',
    linkText: raw?.linkText ?? null,
    offerBadge: raw?.offerBadge ?? null,
  };
}

function mapPhenomenalDeals(raw: any): PhenomenalDealsData | null {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: String(raw?.id ?? ''),
    sectionBadge: raw?.sectionBadge ?? '',
    sectionHeading: raw?.sectionHeading ?? '',
    card1: mapDealCard(raw?.card1 ?? {}),
    card2: mapDealCard(raw?.card2 ?? {}),
    card3: mapDealCard(raw?.card3 ?? {}),
    card4: mapDealCard(raw?.card4 ?? {}),
  };
}

function mapTestimonialSection(raw: any): TestimonialSectionData | null {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: String(raw?.id ?? ''),
    sectionBadge: raw?.sectionBadge ?? '',
    sectionHeading: raw?.sectionHeading ?? '',
  };
}

function mapTestimonial(raw: any): TestimonialItem {
  const rating = Math.max(1, Math.min(5, Number(raw?.rating ?? 5)));
  const personRating = Array.isArray(raw?.personRating) && raw.personRating.length
    ? raw.personRating
    : Array.from({ length: rating }, (_, i) => i + 1);
  return {
    id: String(raw?.id ?? ''),
    personName: raw?.personName ?? '',
    country: raw?.country ?? '',
    date: raw?.date ?? '',
    personComment: raw?.personComment ?? '',
    personRating,
    sortOrder: Number(raw?.sortOrder ?? 0),
  };
}

function mapTourParentCategory(raw: any): TourParentCategoryItem {
  return {
    id: String(raw?.id ?? ''),
    title: raw?.title ?? '',
    slug: raw?.slug ?? '',
    imageUrl: raw?.imageUrl ?? null,
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
        phenomenalDeals: null,
        testimonialSection: null,
        testimonials: [],
        tourParentCategories: [],
        tours: [],
        hotels: [],
        destinations: [],
        bundlesTours: [],
      });
    }
    return this.http.get<{
      sliders?: unknown[];
      phenomenalDeals?: unknown;
      testimonialSection?: unknown;
      testimonials?: unknown[];
      tourParentCategories?: unknown[];
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
          phenomenalDeals: mapPhenomenalDeals(res?.phenomenalDeals),
          testimonialSection: mapTestimonialSection(res?.testimonialSection),
          testimonials: (res?.testimonials ?? []).map((t: any) => mapTestimonial(t)),
          tourParentCategories: (res?.tourParentCategories ?? []).map((c: any) => mapTourParentCategory(c)),
          tours,
          hotels: (res?.hotels ?? []).map((h: any) => mapHotel(h)),
          destinations: (res?.destinations ?? []).map((d: any) => mapDestination(d)),
          bundlesTours,
        };
      }),
      catchError(() =>
        of({
          sliders: [],
          phenomenalDeals: null,
          testimonialSection: null,
          testimonials: [],
          tourParentCategories: [],
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
