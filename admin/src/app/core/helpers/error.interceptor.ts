import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from '../services/auth.service';
import { AuthfakeauthenticationService } from '../services/authfake.service';
import { NotificationService } from '../services/notification.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(
        private authenticationService: AuthenticationService,
        private authFackservice: AuthfakeauthenticationService,
        private notify: NotificationService
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401) {
                if (environment.defaultauth === 'firebase') {
                    this.authenticationService.logout();
                } else {
                    this.authFackservice.logout();
                }
                location.reload();
            } else {
                const message = err?.error?.message || err?.message || err?.statusText || 'Something went wrong';
                this.notify.error(message, 'Error');
            }
            return throwError(err);
        }));
    }
}