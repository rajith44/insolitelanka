import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl ?? '';

export interface ContactSubmissionItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactSubmissionsService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ContactSubmissionItem[]> {
    if (!API) return of([]);
    return this.http.get<any[]>(`${API}/contact-submissions`).pipe(
      map(list => (list ?? []).map((raw: any) => ({
        id: String(raw.id ?? ''),
        name: raw.name ?? '',
        email: raw.email ?? '',
        phone: raw.phone ?? '',
        message: raw.message ?? '',
        createdAt: raw.createdAt ?? raw.created_at ?? ''
      }))),
      catchError(() => of([]))
    );
  }
}
