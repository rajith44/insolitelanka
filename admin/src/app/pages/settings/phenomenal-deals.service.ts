import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PhenomenalDealsData } from './phenomenal-deals.model';

const API = environment.apiUrl ?? '';

function mapCard(raw: any): PhenomenalDealsData['card1'] {
  return {
    imageUrl: raw?.imageUrl ?? '',
    label: raw?.label ?? '',
    title: raw?.title ?? '',
    subtitle: raw?.subtitle ?? '',
    linkUrl: raw?.linkUrl ?? '',
    linkText: raw?.linkText ?? '',
    offerBadge: raw?.offerBadge ?? '',
  };
}

function mapApiToData(raw: any): PhenomenalDealsData {
  return {
    id: String(raw?.id ?? ''),
    sectionBadge: raw?.sectionBadge ?? '',
    sectionHeading: raw?.sectionHeading ?? '',
    card1: mapCard(raw?.card1),
    card2: mapCard(raw?.card2),
    card3: mapCard(raw?.card3),
    card4: mapCard(raw?.card4),
  };
}

@Injectable({
  providedIn: 'root',
})
export class PhenomenalDealsService {
  constructor(private http: HttpClient) {}

  get(): Observable<PhenomenalDealsData | null> {
    if (!API) return of(null);
    return this.http.get<any>(`${API}/home-phenomenal-deals`).pipe(
      map(mapApiToData),
      catchError(() => of(null))
    );
  }

  update(formData: FormData): Observable<PhenomenalDealsData | null> {
    if (!API) return of(null);
    return this.http.post<any>(`${API}/home-phenomenal-deals`, formData).pipe(
      map(mapApiToData),
      catchError(() => of(null))
    );
  }
}
