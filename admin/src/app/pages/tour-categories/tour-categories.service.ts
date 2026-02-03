import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TourCategory } from './tour-category.model';

const API = environment.apiUrl ?? '';

function mapApiToTourCategory(c: any): TourCategory {
  return {
    id: String(c.id),
    parentId: c.parentId != null ? String(c.parentId) : (c.parent_id != null ? String(c.parent_id) : null),
    parentTitle: c.parentTitle ?? c.parent_title,
    title: c.title ?? '',
    slug: c.slug ?? '',
    shortDescription: c.shortDescription ?? c.short_description ?? '',
    imageUrl: c.imageUrl ?? '',
    media_id: c.media_id,
    createdAt: c.createdAt ?? c.created_at,
    updatedAt: c.updatedAt ?? c.updated_at
  };
}

@Injectable({
  providedIn: 'root'
})
export class TourCategoriesService {
  private categories: TourCategory[] = [
    {
      id: '1',
      title: 'Adventure',
      slug: 'adventure',
      shortDescription: 'Thrilling adventures and outdoor activities.',
      imageUrl: 'assets/images/small/img-1.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  /** Cached list for sync access (e.g. ToursService.enrichTour); updated when getAll() is used */
  private cachedCategories: TourCategory[] = [];

  constructor(private http: HttpClient) {}

  getAll(): Observable<TourCategory[]> {
    if (!API) {
      return of([...this.categories]).pipe(tap(list => (this.cachedCategories = list)));
    }
    return this.http.get<any[]>(`${API}/tour-categories`).pipe(
      map(list => (list ?? []).map(mapApiToTourCategory)),
      tap(list => (this.cachedCategories = list)),
      catchError(() => of(this.categories).pipe(tap(list => (this.cachedCategories = list))))
    );
  }

  getById(id: string): Observable<TourCategory | undefined> {
    if (!API) {
      const cat = this.categories.find(x => x.id === id);
      return of(cat ? { ...cat } : undefined);
    }
    return this.http.get<any>(`${API}/tour-categories/${id}`).pipe(
      map(mapApiToTourCategory),
      catchError(() => of(undefined))
    );
  }

  create(formData: FormData): Observable<TourCategory | null> {
    if (!API) {
      const parentId = formData.get('parent_id') as string;
      const title = formData.get('title') as string;
      const slug = formData.get('slug') as string;
      const shortDescription = formData.get('short_description') as string;
      const now = new Date().toISOString();
      const newCat: TourCategory = {
        id: String(Date.now()),
        parentId: parentId && parentId !== '' ? parentId : null,
        title: title ?? '',
        slug: slug ?? '',
        shortDescription: shortDescription ?? '',
        imageUrl: '',
        createdAt: now,
        updatedAt: now
      };
      this.categories.push(newCat);
      this.cachedCategories = [...this.categories];
      return of(newCat);
    }
    return this.http.post<any>(`${API}/tour-categories`, formData).pipe(
      map(mapApiToTourCategory),
      catchError(() => of(null))
    );
  }

  update(id: string, formData: FormData): Observable<TourCategory | null> {
    if (!API) {
      const index = this.categories.findIndex(x => x.id === id);
      if (index === -1) return of(null);
      const parentId = formData.get('parent_id') as string;
      const title = formData.get('title') as string;
      const slug = formData.get('slug') as string;
      const shortDescription = formData.get('short_description') as string;
      this.categories[index] = {
        ...this.categories[index],
        parentId: parentId !== undefined && parentId !== '' ? parentId : null,
        title: title ?? this.categories[index].title,
        slug: slug ?? this.categories[index].slug,
        shortDescription: shortDescription ?? this.categories[index].shortDescription,
        updatedAt: new Date().toISOString()
      };
      this.cachedCategories = [...this.categories];
      return of(this.categories[index]);
    }
    return this.http.post<any>(`${API}/tour-categories/${id}`, formData).pipe(
      map(mapApiToTourCategory),
      catchError(() => of(null))
    );
  }

  delete(id: string): Observable<boolean> {
    if (!API) {
      const index = this.categories.findIndex(x => x.id === id);
      if (index === -1) return of(false);
      this.categories.splice(index, 1);
      this.cachedCategories = [...this.categories];
      return of(true);
    }
    return this.http.delete(`${API}/tour-categories/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /** Synchronous access to categories (e.g. ToursService.enrichTour); may be empty until getAll() has been used */
  getCategoriesSync(): TourCategory[] {
    return [...this.cachedCategories];
  }
}
