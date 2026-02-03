import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Destination, Country } from './destination.model';

const COUNTRIES: Country[] = [
  { id: 'sl', name: 'Sri Lanka' },
  { id: 'md', name: 'Maldives' },
  { id: 'vt', name: 'Vietnam' },
  { id: 'in', name: 'India' },
  { id: 'bali', name: 'Bali' }
];

const API = environment.apiUrl ?? '';

function mapApiToDestination(d: any): Destination {
  return {
    id: String(d.id),
    title: d.title,
    slug: d.slug ?? '',
    countryId: d.countryId ?? d.country_id,
    countryName: COUNTRIES.find(c => c.id === (d.countryId ?? d.country_id))?.name,
    mainDescription: d.mainDescription ?? d.main_description ?? '',
    subTitle: d.subTitle ?? d.sub_title ?? '',
    subDescription: d.subDescription ?? d.sub_description ?? '',
    destinationHighlights: (d.destinationHighlights ?? []).map((h: any) => ({
      imageUrl: h.imageUrl ?? '',
      shortDescription: h.shortDescription ?? h.short_description ?? '',
      media_id: h.media_id,
    })),
    mainImageUrl: d.mainImageUrl ?? d.main_image_url ?? '',
    main_media_id: d.main_media_id,
    imageUrls: d.imageUrls ?? d.image_urls ?? [],
    gallery_media_ids: d.gallery_media_ids ?? [],
    createdAt: d.createdAt ?? d.created_at,
    updatedAt: d.updatedAt ?? d.updated_at,
  };
}

@Injectable({
  providedIn: 'root'
})
export class DestinationsService {
  private destinations: Destination[] = [
    {
      id: '1',
      title: 'Welcome To Egypt',
      slug: 'welcome-to-egypt',
      countryId: 'eg',
      countryName: 'Egypt',
      mainDescription: '<p>Egypt has one of the longest histories of any country.</p>',
      subTitle: 'Heaven On Earth',
      subDescription: '<p>Egypt has one of the longest histories of any country.</p>',
      destinationHighlights: [
        { imageUrl: 'assets/images/small/img-1.jpg', shortDescription: 'Exploring ancient ruins and historical landmarks.' },
        { imageUrl: 'assets/images/small/img-2.jpg', shortDescription: 'Immersive cultural experiences and local traditions.' }
      ],
      mainImageUrl: 'assets/images/small/img-1.jpg',
      imageUrls: ['assets/images/small/img-2.jpg', 'assets/images/small/img-3.jpg', 'assets/images/small/img-4.jpg'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  constructor(private http: HttpClient) {}

  getCountries(): Country[] {
    return [...COUNTRIES];
  }

  getAll(): Observable<Destination[]> {
    if (!API) {
      return of(this.destinations.map(d => ({
        ...d,
        countryName: COUNTRIES.find(c => c.id === d.countryId)?.name ?? d.countryName
      })));
    }
    return this.http.get<any[]>(`${API}/destinations`).pipe(
      map(list => (list ?? []).map(mapApiToDestination)),
      catchError(() => of(this.destinations.map(d => ({
        ...d,
        countryName: COUNTRIES.find(c => c.id === d.countryId)?.name ?? d.countryName
      }))))
    );
  }

  getById(id: string): Observable<Destination | undefined> {
    if (!API) {
      const d = this.destinations.find(x => x.id === id);
      return of(d ? {
        ...d,
        countryName: COUNTRIES.find(c => c.id === d.countryId)?.name ?? d.countryName
      } : undefined);
    }
    return this.http.get<any>(`${API}/destinations/${id}`).pipe(
      map(mapApiToDestination),
      catchError(() => of(undefined))
    );
  }

  create(formData: FormData): Observable<Destination | null> {
    if (!API) {
      const title = formData.get('title') as string;
      const slug = formData.get('slug') as string;
      const countryId = formData.get('country_id') as string;
      const now = new Date().toISOString();
      const newDest: Destination = {
        id: String(Date.now()),
        title: title ?? '',
        slug: slug ?? '',
        countryId: countryId ?? '',
        countryName: COUNTRIES.find(c => c.id === countryId)?.name,
        mainDescription: (formData.get('main_description') as string) ?? '',
        subTitle: (formData.get('sub_title') as string) ?? '',
        subDescription: (formData.get('sub_description') as string) ?? '',
        destinationHighlights: [],
        mainImageUrl: '',
        imageUrls: [],
        createdAt: now,
        updatedAt: now
      };
      this.destinations.push(newDest);
      return of(newDest);
    }
    return this.http.post<any>(`${API}/destinations`, formData).pipe(
      map(mapApiToDestination),
      catchError(() => of(null))
    );
  }

  update(id: string, formData: FormData): Observable<Destination | null> {
    if (!API) {
      const index = this.destinations.findIndex(x => x.id === id);
      if (index === -1) return of(null);
      const title = formData.get('title') as string;
      const slug = formData.get('slug') as string;
      const countryId = formData.get('country_id') as string;
      this.destinations[index] = {
        ...this.destinations[index],
        title: title ?? this.destinations[index].title,
        slug: slug ?? this.destinations[index].slug,
        countryId: countryId ?? this.destinations[index].countryId,
        countryName: countryId ? COUNTRIES.find(c => c.id === countryId)?.name : this.destinations[index].countryName,
        mainDescription: (formData.get('main_description') as string) ?? this.destinations[index].mainDescription,
        subTitle: (formData.get('sub_title') as string) ?? this.destinations[index].subTitle,
        subDescription: (formData.get('sub_description') as string) ?? this.destinations[index].subDescription,
        updatedAt: new Date().toISOString()
      };
      return of(this.destinations[index]);
    }
    // Use POST for FormData: PHP does not parse multipart/form-data on PUT, so backend receives empty body
    return this.http.post<any>(`${API}/destinations/${id}`, formData).pipe(
      map(mapApiToDestination),
      catchError(() => of(null))
    );
  }

  delete(id: string): Observable<boolean> {
    if (!API) {
      const index = this.destinations.findIndex(x => x.id === id);
      if (index === -1) return of(false);
      this.destinations.splice(index, 1);
      return of(true);
    }
    return this.http.delete(`${API}/destinations/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
