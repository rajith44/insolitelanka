import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

const API = environment.apiUrl ?? '';

export interface NewsletterResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class NewsletterService {
  constructor(private http: HttpClient) {}

  subscribe(email: string): Observable<NewsletterResponse | null> {
    if (!API) return of(null);
    return this.http.post<NewsletterResponse>(`${API}/newsletter`, { email }).pipe(
      map(res => res ?? null),
      catchError(err => throwError(() => err))
    );
  }
}
