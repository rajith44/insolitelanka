import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

const API = environment.apiUrl ?? '';

export interface GalleryPhoto {
  id: string;
  media_id: number;
  imageUrl: string | null;
  sortOrder: number;
  createdAt?: string;
}

function mapApiToPhoto(raw: any): GalleryPhoto {
  return {
    id: String(raw?.id ?? ''),
    media_id: raw?.media_id ?? 0,
    imageUrl: raw?.imageUrl ?? null,
    sortOrder: Number(raw?.sortOrder ?? raw?.sort_order ?? 0),
    createdAt: raw?.createdAt ?? raw?.created_at,
  };
}

@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  constructor(private http: HttpClient) {}

  getPhotos(): Observable<GalleryPhoto[]> {
    if (!API) return of([]);
    return this.http.get<any[]>(`${API}/gallery`).pipe(
      map(list => (list ?? []).map(mapApiToPhoto)),
      catchError(() => of([]))
    );
  }
}
