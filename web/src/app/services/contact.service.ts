import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

const API = environment.apiUrl ?? '';

export interface ContactFormPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
  /** Honeypot: must be empty (bots often fill it) */
  website_url?: string;
  /** reCAPTCHA v2 response token when site key is configured */
  recaptcha_token?: string;
}

export interface ContactFormResponse {
  message: string;
  id: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  constructor(private http: HttpClient) {}

  submitForm(payload: ContactFormPayload): Observable<ContactFormResponse | null> {
    if (!API) return of(null);
    return this.http.post<ContactFormResponse>(`${API}/contact-form`, payload).pipe(
      map(res => res ?? null),
      catchError(() => of(null))
    );
  }
}
