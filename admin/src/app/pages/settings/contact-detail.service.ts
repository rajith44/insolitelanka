import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContactDetail } from './contact-detail.model';

const API = environment.apiUrl ?? '';

function mapApiToContact(c: any): ContactDetail {
  return {
    id: String(c.id),
    email: c.email ?? '',
    phone: c.phone ?? '',
    address: c.address ?? '',
    mapEmbed: c.mapEmbed ?? c.map_embed ?? '',
    facebookUrl: c.facebookUrl ?? c.facebook_url ?? '',
    twitterUrl: c.twitterUrl ?? c.twitter_url ?? '',
    instagramUrl: c.instagramUrl ?? c.instagram_url ?? '',
    linkedinUrl: c.linkedinUrl ?? c.linkedin_url ?? '',
    updatedAt: c.updatedAt ?? c.updated_at
  };
}

@Injectable({
  providedIn: 'root'
})
export class ContactDetailService {
  constructor(private http: HttpClient) {}

  get(): Observable<ContactDetail | null> {
    if (!API) return of(null);
    return this.http.get<any>(`${API}/contact-details`).pipe(
      map(mapApiToContact),
      catchError(() => of(null))
    );
  }

  update(data: Partial<ContactDetail>): Observable<ContactDetail | null> {
    if (!API) return of(null);
    const body = {
      email: data.email ?? '',
      phone: data.phone ?? '',
      address: data.address ?? '',
      map_embed: data.mapEmbed ?? '',
      facebook_url: data.facebookUrl ?? '',
      twitter_url: data.twitterUrl ?? '',
      instagram_url: data.instagramUrl ?? '',
      linkedin_url: data.linkedinUrl ?? ''
    };
    return this.http.put<any>(`${API}/contact-details`, body).pipe(
      map(mapApiToContact),
      catchError(() => of(null))
    );
  }
}
