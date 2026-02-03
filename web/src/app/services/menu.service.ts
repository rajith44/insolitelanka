import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TourMenuTour {
  tourId: string;
  tourTitle: string;
  slug: string;
  tourImage: string;
}

export interface TourMenuItem {
  tourCategoryName: string;
  tourCategoryId: string;
  slug: string;
  subcategories: any[];
}

export interface DestinationMenuPlace {
  name: string;
  slug: string;
}

export interface DestinationMenuItem {
  country: string;
  slug: string;
  places: DestinationMenuPlace[];
}

export interface MenuResponse {
  tours: TourMenuItem[];
  destinations: DestinationMenuItem[];
}

const API = environment.apiUrl ?? '';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  constructor(private http: HttpClient) {}

  getMenu(): Observable<MenuResponse> {
    if (!API) {
      return of({ tours: [], destinations: [] });
    }
    return this.http.get<MenuResponse>(`${API}/menu`).pipe(
      catchError(() => of({ tours: [], destinations: [] })),
      map(menu => ({
        tours: (menu.tours ?? []).map(cat => ({
          ...cat,
          subcategories: cat.subcategories ?? [],
        })),
        destinations: (menu.destinations ?? []).map(c => ({
          ...c,
          places: c.places ?? [],
        })),
      }))
    );
  }
}
