import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestimonialSection, Testimonial } from './testimonial.model';

const API = environment.apiUrl ?? '';

function mapSection(raw: any): TestimonialSection {
  return {
    id: String(raw?.id ?? ''),
    sectionBadge: raw?.sectionBadge ?? '',
    sectionHeading: raw?.sectionHeading ?? '',
  };
}

function mapTestimonial(raw: any): Testimonial {
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

@Injectable({
  providedIn: 'root',
})
export class TestimonialService {
  constructor(private http: HttpClient) {}

  getSection(): Observable<TestimonialSection | null> {
    if (!API) return of(null);
    return this.http.get<any>(`${API}/home-testimonial-section`).pipe(
      map(mapSection),
      catchError(() => of(null))
    );
  }

  updateSection(data: { sectionBadge: string; sectionHeading: string }): Observable<TestimonialSection | null> {
    if (!API) return of(null);
    return this.http.put<any>(`${API}/home-testimonial-section`, {
      section_badge: data.sectionBadge,
      section_heading: data.sectionHeading,
    }).pipe(
      map(mapSection),
      catchError(() => of(null))
    );
  }

  getAll(): Observable<Testimonial[]> {
    if (!API) return of([]);
    return this.http.get<any[]>(`${API}/home-testimonials`).pipe(
      map(list => (list ?? []).map(mapTestimonial)),
      catchError(() => of([]))
    );
  }

  getById(id: string): Observable<Testimonial | undefined> {
    if (!API) return of(undefined);
    return this.http.get<any>(`${API}/home-testimonials/${id}`).pipe(
      map(mapTestimonial),
      catchError(() => of(undefined))
    );
  }

  create(data: Partial<Testimonial>): Observable<Testimonial | null> {
    if (!API) return of(null);
    const rating = (Array.isArray(data.personRating) && data.personRating.length > 0) ? data.personRating.length : 5;
    return this.http.post<any>(`${API}/home-testimonials`, {
      person_name: data.personName ?? '',
      country: data.country ?? '',
      date: data.date ?? '',
      person_comment: data.personComment ?? '',
      rating,
    }).pipe(
      map(mapTestimonial),
      catchError(() => of(null))
    );
  }

  update(id: string, data: Partial<Testimonial>): Observable<Testimonial | null> {
    if (!API) return of(null);
    const rating = (Array.isArray(data.personRating) && data.personRating.length > 0) ? data.personRating.length : 5;
    return this.http.put<any>(`${API}/home-testimonials/${id}`, {
      person_name: data.personName ?? '',
      country: data.country ?? '',
      date: data.date ?? '',
      person_comment: data.personComment ?? '',
      rating,
    }).pipe(
      map(mapTestimonial),
      catchError(() => of(null))
    );
  }

  delete(id: string): Observable<boolean> {
    if (!API) return of(false);
    return this.http.delete(`${API}/home-testimonials/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
