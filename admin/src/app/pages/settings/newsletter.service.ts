import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl ?? '';

export interface NewsletterSubscriberItem {
  id: string;
  email: string;
  subscribedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<NewsletterSubscriberItem[]> {
    if (!API) return of([]);
    return this.http.get<any[]>(`${API}/newsletter`).pipe(
      map(list => (list ?? []).map((raw: any) => ({
        id: String(raw.id ?? ''),
        email: raw.email ?? '',
        subscribedAt: raw.subscribedAt ?? raw.subscribed_at ?? ''
      }))),
      catchError(() => of([]))
    );
  }
}
