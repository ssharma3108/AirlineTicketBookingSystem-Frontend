import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthResponse } from '../../models/models';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="auth-shell">
      <div class="auth-layout">
        <aside class="auth-visual">
          <img src="https://images.unsplash.com/photo-1474302770737-173ee21bab63?auto=format&fit=crop&w=1400&q=80" alt="Aircraft in sky">
        </aside>

        <div class="auth-card-wrap">
          <div class="page-title">
            <h1>Login</h1>
            <p>Use your SkyBooker account to continue booking.</p>
          </div>

          <form class="auth-card" (ngSubmit)="submit()">
            <div class="grid two">
              <div>
                <label>Email</label>
                <input name="email" [(ngModel)]="email" type="email" required>
              </div>
              <div>
                <label>Password</label>
                <input name="password" [(ngModel)]="password" type="password" required>
              </div>
            </div>

            <p *ngIf="error" class="alert error">{{ error }}</p>
            <button class="btn primary section" type="submit" [disabled]="loading">{{ loading ? 'Logging in...' : 'Login' }}</button>
            <button class="btn google-btn section" type="button" (click)="googleLogin()">
              <span class="google-logo" aria-hidden="true">G</span>
              <span>Continue with Google</span>
            </button>
            <p class="muted"><a class="forgot-link" routerLink="/forgot-password">Forgot Password ?</a></p>
            <p class="muted">New here? <a routerLink="/register">Create an account</a></p>
          </form>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .auth-shell {
      min-height: calc(100vh - 68px);
      padding: 24px;
      background:
        radial-gradient(circle at 20% 15%, rgba(69, 120, 204, 0.2), transparent 36%),
        radial-gradient(circle at 85% 12%, rgba(32, 163, 171, 0.16), transparent 35%),
        #eef3fb;
    }

    .auth-layout {
      max-width: 1220px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.05fr 1fr;
      gap: 22px;
      align-items: stretch;
    }

    .auth-visual img {
      width: 100%;
      height: 100%;
      min-height: 560px;
      object-fit: cover;
      border-radius: 16px;
      border: 1px solid #d7e3f4;
      box-shadow: 0 24px 48px rgba(20, 45, 88, 0.14);
    }

    .auth-card-wrap {
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(8px);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.66), rgba(255, 255, 255, 0.48));
      box-shadow: 0 20px 42px rgba(17, 45, 88, 0.12);
      padding: 26px 24px;
      align-self: center;
    }

    .auth-card {
      margin-top: 14px;
      padding: 20px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.68);
      border: 1px solid #d9e5f5;
    }

    .google-btn {
      width: 100%;
      min-height: 44px;
      background: #ffffff;
      color: #12395f;
      border: 1px solid #cadcf2;
      transition: background-color 0.2s ease, transform 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .google-btn:hover {
      background: #f1f7ff;
      transform: translateY(-1px);
    }

    .google-logo {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 13px;
      color: #ffffff;
      background: conic-gradient(
        from 220deg,
        #ea4335 0deg 90deg,
        #fbbc05 90deg 170deg,
        #34a853 170deg 260deg,
        #4285f4 260deg 360deg
      );
      box-shadow: 0 2px 8px rgba(49, 89, 145, 0.25);
    }

    .forgot-link {
      color: #1f6feb;
      font-weight: 700;
    }

    @media (max-width: 980px) {
      .auth-layout {
        grid-template-columns: 1fr;
      }

      .auth-visual img {
        min-height: 260px;
      }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  googleLogin(): void {
    this.auth.loginWithGoogle();
  }

  submit(): void {
    this.loading = true;
    this.error = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (user: AuthResponse) => {
        if (user.role === 'ADMIN' || user.role === 'STAFF') {
          this.router.navigate(['/role-welcome']);
          return;
        }

        this.router.navigate(['/flights']);
      },
      error: () => {
        this.error = 'Login failed. Check your email, password, and backend services.';
        this.loading = false;
      }
    });
  }
}

