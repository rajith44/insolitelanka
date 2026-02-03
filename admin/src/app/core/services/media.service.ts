import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MediaItem, MediaListResponse } from '../../shared/media-picker/media.model';

const API = environment.apiUrl ?? '';

function mapApiToItem(raw: any): MediaItem {
  return {
    id: Number(raw.id),
    url: raw.url ?? null,
    type: raw.type ?? null,
    fileName: raw.fileName ?? raw.file_name ?? null,
    realName: raw.realName ?? raw.real_name ?? null,
    extension: raw.extension ?? null,
    size: Number(raw.size ?? 0),
    createdAt: raw.createdAt ?? raw.created_at
  };
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  constructor(private http: HttpClient) {}

  getList(params?: { page?: number; per_page?: number; type?: 'image' | 'video' }): Observable<MediaListResponse> {
    if (!API) {
      return of({ data: [], meta: { current_page: 1, last_page: 1, per_page: 50, total: 0 } });
    }
    let httpParams = new HttpParams();
    if (params?.page != null) httpParams = httpParams.set('page', String(params.page));
    if (params?.per_page != null) httpParams = httpParams.set('per_page', String(params.per_page));
    if (params?.type) httpParams = httpParams.set('type', params.type);

    return this.http.get<any>(`${API}/media`, { params: httpParams }).pipe(
      map((res) => ({
        data: (res.data ?? []).map(mapApiToItem),
        meta: res.meta ?? { current_page: 1, last_page: 1, per_page: 50, total: 0 }
      })),
      catchError(() => of({ data: [], meta: { current_page: 1, last_page: 1, per_page: 50, total: 0 } }))
    );
  }

  upload(files: File[]): Observable<MediaItem[]> {
    if (!API || !files?.length) return of([]);
    const formData = new FormData();
    files.forEach((f) => formData.append('files[]', f));
    return this.http.post<any[]>(`${API}/media`, formData).pipe(
      map((list) => (Array.isArray(list) ? list : []).map(mapApiToItem)),
      catchError(() => of([]))
    );
  }
}
