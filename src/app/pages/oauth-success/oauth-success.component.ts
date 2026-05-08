import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthResponse } from '../../models/models';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-oauth-success',
  imports: [CommonModule],
  template: `
    <section class="page">
      <div class="card section">
        <h2>Completing Google login...</h2>
        <p class="muted" *ngIf="!error">Please wait while we sign you in.</p>
        <p class="alert error" *ngIf="error">{{ error }}</p>
      </div>
    </section>
  `
})
export class OauthSuccessComponent implements OnInit {
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.error = 'Google login failed. Token missing.';
      return;
    }

    this.auth.consumeOAuthToken(token).subscribe({
      next: (user: AuthResponse) => {
        if (user.role === 'ADMIN' || user.role === 'STAFF') {
          this.router.navigate(['/role-welcome']);
          return;
        }
        this.router.navigate(['/flights']);
      },
      error: () => {
        this.error = 'Google login failed while loading profile.';
      }
    });
  }
}

