import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="auth-shell">
      <div class="auth-layout">
        <aside class="auth-visual">
          <img src="https://images.unsplash.com/photo-1521727857535-28d2047314ac?auto=format&fit=crop&w=1400&q=80" alt="Airplane in clouds">
        </aside>

        <div class="auth-card-wrap">
          <div class="page-title">
            <h1>Forgot Password</h1>
            <p>Reset your password using OTP on your email.</p>
          </div>

          <section class="auth-card">
            <div *ngIf="step === 1">
              <label>Email</label>
              <input name="forgotEmail" [(ngModel)]="email" type="email" placeholder="Enter your email">
              <button class="btn primary section" type="button" [disabled]="loading" (click)="requestOtp()">
                {{ loading ? 'Sending OTP...' : 'Send OTP' }}
              </button>
            </div>

            <div *ngIf="step === 2">
              <label>OTP</label>
              <input name="forgotOtp" [(ngModel)]="otp" maxlength="6" placeholder="Enter 6-digit OTP">
              <button class="btn primary section" type="button" [disabled]="loading" (click)="verifyOtp()">
                {{ loading ? 'Verifying...' : 'Verify OTP' }}
              </button>
            </div>

            <div *ngIf="step === 3">
              <label>New Password</label>
              <input name="newPassword" [(ngModel)]="newPassword" type="password" minlength="6" placeholder="Enter new password">
              <label class="section">Confirm New Password</label>
              <input name="confirmPassword" [(ngModel)]="confirmPassword" type="password" minlength="6" placeholder="Confirm new password">
              <button class="btn primary section" type="button" [disabled]="loading" (click)="resetPassword()">
                {{ loading ? 'Updating...' : 'Reset Password' }}
              </button>
            </div>

            <p *ngIf="message" class="alert success">{{ message }}</p>
            <p *ngIf="error" class="alert error">{{ error }}</p>
            <p class="muted"><a routerLink="/login">Back to Login</a></p>
          </section>
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
export class ForgotPasswordComponent {
  step = 1;
  loading = false;
  email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';
  message = '';
  error = '';

  constructor(private auth: AuthService) {}

  requestOtp(): void {
    this.error = '';
    this.message = '';

    if (!this.email.trim()) {
      this.error = 'Email is required.';
      return;
    }

    this.loading = true;
    this.auth.requestForgotPasswordOtp(this.email.trim().toLowerCase()).subscribe({
      next: (res) => {
        this.message = res.message;
        this.step = 2;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Could not send OTP.';
        this.loading = false;
      }
    });
  }

  verifyOtp(): void {
    this.error = '';
    this.message = '';

    if (!/^[0-9]{6}$/.test(this.otp)) {
      this.error = 'OTP must be 6 digits.';
      return;
    }

    this.loading = true;
    this.auth.verifyForgotPasswordOtp(this.email.trim().toLowerCase(), this.otp).subscribe({
      next: (res) => {
        this.message = res.message;
        this.step = 3;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'OTP verification failed.';
        this.loading = false;
      }
    });
  }

  resetPassword(): void {
    this.error = '';
    this.message = '';

    if (this.newPassword.length < 6) {
      this.error = 'New password must be at least 6 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'New password and confirm password do not match.';
      return;
    }

    this.loading = true;
    this.auth.resetPasswordWithOtp(
      this.email.trim().toLowerCase(),
      this.otp,
      this.newPassword,
      this.confirmPassword
    ).subscribe({
      next: (res) => {
        this.message = res.message;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Password reset failed.';
        this.loading = false;
      }
    });
  }
}

