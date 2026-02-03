import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../core/services/authfake.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})

/**
 * Login Component - uses real backend API when environment.apiUrl is set (JWT auth)
 */
export class LoginComponent implements OnInit {

  year: number = new Date().getFullYear();
  showNavigationArrows: any;
  loginForm!: UntypedFormGroup;
  submitted = false;
  error = '';
  returnUrl!: string;
  layout_mode!: string;
  fieldTextType!: boolean;
  loading = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private authFackservice: AuthfakeauthenticationService,
  ) {
    if (environment.defaultauth === 'firebase') {
      if (this.authenticationService.currentUserValue) {
        this.router.navigate(['/']);
      }
    } else {
      if (this.authFackservice.currentUserValue) {
        this.router.navigate(['/']);
      }
    }
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: [environment.apiUrl ? '' : 'admin@themesbrand.com', [Validators.required, Validators.email]],
      password: [environment.apiUrl ? '' : '123456', [Validators.required]],
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    document.body.setAttribute('data-layout', 'vertical');
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    if (environment.defaultauth === 'firebase') {
      this.authenticationService.login(this.f.email.value, this.f.password.value)
        .then(() => this.router.navigate([this.returnUrl]))
        .catch(err => {
          this.error = err?.message ?? 'Login failed';
          this.loading = false;
        });
      return;
    }

    this.authFackservice.login(this.f.email.value, this.f.password.value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate([this.returnUrl]);
        },
        error: err => {
          this.loading = false;
          this.error = err?.error?.message ?? err?.message ?? 'Invalid email or password';
        }
      });
  }

  /**
   * Password Hide/Show
   */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

}
