import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GalleryItem } from './gallery.model';

const API = environment.apiUrl ?? '';

function mapApiToItem(raw: any): GalleryItem {
  return {
    id: String(raw.id),
    media_id: raw.media_id ?? 0,
    imageUrl: raw.imageUrl ?? null,
    sortOrder: Number(raw.sortOrder ?? raw.sort_order ?? 0),
    createdAt: raw.createdAt ?? raw.created_at
  };
}

@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<GalleryItem[]> {
    if (!API) return of([]);
    return this.http.get<any[]>(`${API}/gallery`).pipe(
      map(list => (list ?? []).map(mapApiToItem)),
      catchError(() => of([]))
    );
  }

  upload(files: File[]): Observable<GalleryItem[]> {
    if (!API || !files?.length) return of([]);
    const formData = new FormData();
    files.forEach(f => formData.append('photos[]', f));
    return this.http.post<any[]>(`${API}/gallery`, formData).pipe(
      map(list => (list ?? []).map(mapApiToItem)),
      catchError(() => of([]))
    );
  }

  /** Add existing media from library to gallery by media IDs */
  addFromLibrary(mediaIds: number[]): Observable<GalleryItem[]> {
    if (!API || !mediaIds?.length) return of([]);
    const formData = new FormData();
    mediaIds.forEach(id => formData.append('media_ids[]', String(id)));
    return this.http.post<any[]>(`${API}/gallery`, formData).pipe(
      map(list => (list ?? []).map(mapApiToItem)),
      catchError(() => of([]))
    );
  }

  delete(id: string): Observable<boolean> {
    if (!API) return of(false);
    return this.http.delete(`${API}/gallery/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
