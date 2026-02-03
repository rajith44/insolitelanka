import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../models/auth.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthfakeauthenticationService {

    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        const stored = localStorage.getItem('currentUser');
        this.currentUserSubject = new BehaviorSubject<User>(stored ? JSON.parse(stored) : null!);
        this.currentUser = this.currentUserSubject.asObservable();
    }

    /**
     * current user
     */
    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    /**
     * Performs the auth - uses real backend API when environment.apiUrl is set
     * @param email email of user
     * @param password password of user
     */
    login(email: string, password: string): Observable<User> {
        const apiUrl = environment.apiUrl;

        if (apiUrl) {
            return this.http.post<any>(`${apiUrl}/auth/login`, { email, password }).pipe(
                map(res => {
                    const user: User = {
                        token: res.token,
                        email: res.user?.email ?? email,
                        id: res.user?.id,
                        username: res.user?.name ?? res.user?.email ?? email,
                        firstName: res.user?.name?.split(' ')[0],
                        lastName: res.user?.name?.split(' ').slice(1).join(' ') || undefined
                    };
                    if (user.token) {
                        localStorage.setItem('currentUser', JSON.stringify(user));
                        this.currentUserSubject.next(user);
                    }
                    return user;
                }),
                catchError(err => {
                    const msg = err.error?.message ?? err.message ?? 'Login failed';
                    throw { error: { message: msg } };
                })
            );
        }

        return this.http.post<any>(`/users/authenticate`, { email, password }).pipe(
            map(user => {
                if (user && user.token) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                }
                return user;
            })
        );
    }

    /**
     * Logout the user
     */
    logout() {
        const apiUrl = environment.apiUrl;
        if (apiUrl) {
            this.http.post(`${apiUrl}/auth/logout`, {}).subscribe({ error: () => {} });
        }
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null!);
    }
}
