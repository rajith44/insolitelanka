import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HomePageSlider } from './home-page-slider.model';

const API = environment.apiUrl ?? '';

function mapApiToSlider(s: any): HomePageSlider {
  return {
    id: String(s.id),
    imageUrl: s.imageUrl ?? '',
    media_id: s.media_id,
    topname: s.topname ?? '',
    title: s.title ?? '',
    subtitle: s.subtitle ?? '',
    sortOrder: Number(s.sortOrder ?? s.sort_order) ?? 0,
    createdAt: s.createdAt ?? s.created_at,
    updatedAt: s.updatedAt ?? s.updated_at
  };
}

@Injectable({
  providedIn: 'root'
})
export class HomePageSliderService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<HomePageSlider[]> {
    if (!API) return of([]);
    return this.http.get<any[]>(`${API}/home-page-sliders`).pipe(
      map(list => (list ?? []).map(mapApiToSlider)),
      catchError(() => of([]))
    );
  }

  getById(id: string): Observable<HomePageSlider | undefined> {
    if (!API) return of(undefined);
    return this.http.get<any>(`${API}/home-page-sliders/${id}`).pipe(
      map(mapApiToSlider),
      catchError(() => of(undefined))
    );
  }

  create(formData: FormData): Observable<HomePageSlider | null> {
    if (!API) return of(null);
    return this.http.post<any>(`${API}/home-page-sliders`, formData).pipe(
      map(mapApiToSlider),
      catchError(() => of(null))
    );
  }

  update(id: string, formData: FormData): Observable<HomePageSlider | null> {
    if (!API) return of(null);
    return this.http.post<any>(`${API}/home-page-sliders/${id}`, formData).pipe(
      map(mapApiToSlider),
      catchError(() => of(null))
    );
  }

  delete(id: string): Observable<boolean> {
    if (!API) return of(false);
    return this.http.delete(`${API}/home-page-sliders/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
