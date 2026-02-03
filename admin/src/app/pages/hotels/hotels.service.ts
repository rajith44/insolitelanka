import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Hotel } from './hotel.model';

const API = environment.apiUrl ?? '';

function mapApiToHotel(h: any): Hotel {
  return {
    id: String(h.id),
    name: h.name ?? '',
    slug: h.slug ?? '',
    description: h.description ?? '',
    highlights: h.highlights ?? '',
    imageUrls: h.imageUrls ?? h.image_urls ?? [],
    gallery_media_ids: h.gallery_media_ids ?? [],
    main_media_id: h.main_media_id,
    priceRangeMin: Number(h.priceRangeMin ?? h.price_range_min ?? 0),
    priceRangeMax: Number(h.priceRangeMax ?? h.price_range_max ?? 0),
    star: Number(h.star ?? 3),
    createdAt: h.createdAt ?? h.created_at,
    updatedAt: h.updatedAt ?? h.updated_at,
  };
}

@Injectable({
  providedIn: 'root'
})
export class HotelsService {
  private hotels: Hotel[] = [
    {
      id: 'h1',
      name: 'Grand Hotel',
      slug: 'grand-hotel',
      description: '<p>Luxury accommodation with premium amenities.</p>',
      imageUrls: ['assets/images/small/img-1.jpg'],
      highlights: 'Pool, Spa, Free WiFi, Restaurant',
      priceRangeMin: 150,
      priceRangeMax: 350,
      star: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'h2',
      name: 'Sea View Resort',
      slug: 'sea-view-resort',
      description: '<p>Beachfront resort with stunning views.</p>',
      imageUrls: ['assets/images/small/img-2.jpg'],
      highlights: 'Beach access, Pool, Bar',
      priceRangeMin: 100,
      priceRangeMax: 250,
      star: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  constructor(private http: HttpClient) {}

  getAll(): Observable<Hotel[]> {
    if (!API) {
      return of([...this.hotels]);
    }
    return this.http.get<any[]>(`${API}/hotels`).pipe(
      map(list => (list ?? []).map(mapApiToHotel)),
      catchError(() => of([...this.hotels]))
    );
  }

  getById(id: string): Observable<Hotel | undefined> {
    if (!API) {
      const h = this.hotels.find(x => x.id === id);
      return of(h ? { ...h } : undefined);
    }
    return this.http.get<any>(`${API}/hotels/${id}`).pipe(
      map(mapApiToHotel),
      catchError(() => of(undefined))
    );
  }

  getHotelsForSelect(): Observable<{ id: string; name: string }[]> {
    return this.getAll().pipe(
      map(list => list.map(h => ({ id: h.id, name: h.name })))
    );
  }

  create(formData: FormData): Observable<Hotel | null> {
    if (!API) {
      const name = formData.get('name') as string;
      const slug = formData.get('slug') as string;
      const now = new Date().toISOString();
      const newHotel: Hotel = {
        id: 'h' + Date.now(),
        name: name ?? '',
        slug: slug ?? '',
        description: (formData.get('description') as string) ?? '',
        highlights: (formData.get('highlights') as string) ?? '',
        imageUrls: [],
        priceRangeMin: Number(formData.get('price_range_min')) || 0,
        priceRangeMax: Number(formData.get('price_range_max')) || 0,
        star: Number(formData.get('star')) || 3,
        createdAt: now,
        updatedAt: now
      };
      this.hotels.push(newHotel);
      return of(newHotel);
    }
    return this.http.post<any>(`${API}/hotels`, formData).pipe(
      map(mapApiToHotel),
      catchError(() => of(null))
    );
  }

  update(id: string, formData: FormData): Observable<Hotel | null> {
    if (!API) {
      const index = this.hotels.findIndex(x => x.id === id);
      if (index === -1) return of(null);
      this.hotels[index] = {
        ...this.hotels[index],
        name: (formData.get('name') as string) ?? this.hotels[index].name,
        slug: (formData.get('slug') as string) ?? this.hotels[index].slug,
        description: (formData.get('description') as string) ?? this.hotels[index].description,
        highlights: (formData.get('highlights') as string) ?? this.hotels[index].highlights,
        priceRangeMin: Number(formData.get('price_range_min')) ?? this.hotels[index].priceRangeMin,
        priceRangeMax: Number(formData.get('price_range_max')) ?? this.hotels[index].priceRangeMax,
        star: Number(formData.get('star')) ?? this.hotels[index].star,
        updatedAt: new Date().toISOString()
      };
      return of(this.hotels[index]);
    }
    return this.http.post<any>(`${API}/hotels/${id}`, formData).pipe(
      map(mapApiToHotel),
      catchError(() => of(null))
    );
  }

  delete(id: string): Observable<boolean> {
    if (!API) {
      const index = this.hotels.findIndex(x => x.id === id);
      if (index === -1) return of(false);
      this.hotels.splice(index, 1);
      return of(true);
    }
    return this.http.delete(`${API}/hotels/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
