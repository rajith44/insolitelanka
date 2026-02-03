import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { environment } from '../../environments/environment';

const API = environment.apiUrl ?? '';

export interface DestinationHighlightItem {
  media_id?: number;
  imageUrl: string | null;
  shortDescription?: string;
}

export interface DestinationDetail {
  id: string;
  title: string;
  slug: string;
  countryId: string;
  mainDescription: string;
  subTitle: string;
  subDescription: string;
  mainImageUrl: string | null;
  imageUrls: string[];
  destinationHighlights: DestinationHighlightItem[];
}

export interface DestinationListItem {
  id: string;
  slug: string;
  title: string;
  mainImageUrl: string | null;
}

/** Tour list item for destination's tours (same shape as tours page). */
export interface DestinationTourListItem {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  duration: string;
  pricePerPerson: number;
  mainImageUrl: string | null;
  categoryIds: string[];
}

function mapDestinationDetail(raw: any): DestinationDetail {
  const highlights = raw?.destinationHighlights ?? [];
  const imageUrls = Array.isArray(raw?.imageUrls) ? raw.imageUrls : [];
  return {
    id: String(raw?.id ?? ''),
    title: raw?.title ?? '',
    slug: raw?.slug ?? '',
    countryId: raw?.countryId ?? raw?.country_id ?? '',
    mainDescription: raw?.mainDescription ?? raw?.main_description ?? '',
    subTitle: raw?.subTitle ?? raw?.sub_title ?? '',
    subDescription: raw?.subDescription ?? raw?.sub_description ?? '',
    mainImageUrl: raw?.mainImageUrl ?? raw?.main_image_url ?? null,
    imageUrls,
    destinationHighlights: highlights.map((h: any) => ({
      media_id: h?.media_id,
      imageUrl: h?.imageUrl ?? null,
      shortDescription: h?.shortDescription ?? h?.short_description ?? '',
    })),
  };
}

function mapDestinationListItem(raw: any): DestinationListItem {
  return {
    id: String(raw?.id ?? ''),
    slug: raw?.slug ?? '',
    title: raw?.title ?? '',
    mainImageUrl: raw?.mainImageUrl ?? raw?.main_image_url ?? null,
  };
}

function mapTourListItem(raw: any): DestinationTourListItem {
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

@Injectable({
  providedIn: 'root',
})
export class DestinationService {
  constructor(private http: HttpClient) {}

  /**
   * Get destination by slug with its tours (for destination detail page).
   */
  getBySlug(slug: string): Observable<{ destination: DestinationDetail; tours: DestinationTourListItem[] } | null> {
    if (!API || !slug) {
      return of(null);
    }
    return this.http
      .get<{ destination: any; tours: any[] }>(`${API}/destinations/slug/${encodeURIComponent(slug)}`)
      .pipe(
        map(res => ({
          destination: mapDestinationDetail(res?.destination ?? {}),
          tours: (res?.tours ?? []).map((t: any) => mapTourListItem(t)),
        })),
        catchError(() => of(null))
      );
  }

  /**
   * Get all destinations (for destination list page, no slug).
   */
  getList(): Observable<DestinationListItem[]> {
    if (!API) {
      return of([]);
    }
    return this.http.get<unknown[]>(`${API}/destinations`).pipe(
      map(list => (list ?? []).map((d: any) => mapDestinationListItem(d))),
      catchError(() => of([]))
    );
  }
}
