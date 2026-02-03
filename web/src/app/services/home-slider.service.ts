import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface HomeSliderItem {
  id: string;
  imageUrl: string;
  topname: string;
  title: string;
  subtitle: string;
  sortOrder: number;
}

const API = environment.apiUrl ?? '';

@Injectable({
  providedIn: 'root'
})
export class HomeSliderService {
  constructor(private http: HttpClient) {}

  getSliders(): Observable<HomeSliderItem[]> {
    if (!API) return of([]);
    return this.http.get<unknown[]>(`${API}/home-page-sliders`).pipe(
      map(list => (list ?? []).map((s: any) => ({
        id: String(s.id),
        imageUrl: s.imageUrl ?? '',
        topname: s.topname ?? '',
        title: s.title ?? '',
        subtitle: s.subtitle ?? '',
        sortOrder: Number(s.sortOrder ?? s.sort_order) ?? 0
      }))),
      catchError(() => of([]))
    );
  }
}
