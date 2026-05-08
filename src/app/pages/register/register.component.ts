import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/models';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="auth-shell">
      <div class="auth-layout">
        <aside class="auth-visual">
          <img src="https://images.unsplash.com/photo-1521727857535-28d2047314ac?auto=format&fit=crop&w=1400&q=80" alt="Passenger airplane in sky">
        </aside>

        <div class="auth-card-wrap">
          <div class="page-title">
            <h1>Create account</h1>
            <p>Matches the backend register DTO fields.</p>
          </div>

          <form class="auth-card" (ngSubmit)="submit()">
            <div class="grid two">
              <div><label>Full name</label><input name="fullName" [(ngModel)]="form.fullName" minlength="3" maxlength="50" required></div>
              <div><label>Email</label><input name="email" [(ngModel)]="form.email" type="email" required></div>
              <div><label>Password</label><input name="password" [(ngModel)]="form.password" type="password" minlength="6" required></div>
              <div><label>Phone</label><input name="phone" [(ngModel)]="form.phone" inputmode="numeric" placeholder="10 digits only" required></div>
              <div><label>Passport number</label><input name="passportNumber" [(ngModel)]="form.passportNumber" minlength="6" maxlength="9" required></div>
              <div><label>Nationality</label><input name="nationality" [(ngModel)]="form.nationality" required></div>
            </div>

            <p class="muted">Phone must be 10 digits only. Do not include +91. Password must be at least 6 characters.</p>
            <p *ngIf="error" class="alert error">{{ error }}</p>
            <button class="btn primary section" type="submit" [disabled]="loading">{{ loading ? 'Creating...' : 'Register' }}</button>
            <p class="muted">Already registered? <a routerLink="/login">Login</a></p>
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
        radial-gradient(circle at 18% 15%, rgba(51, 105, 194, 0.2), transparent 34%),
        radial-gradient(circle at 90% 15%, rgba(31, 155, 168, 0.16), transparent 34%),
        #eef3fb;
    }

    .auth-layout {
      max-width: 1280px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.08fr 1fr;
      gap: 22px;
      align-items: stretch;
    }

    .auth-visual img {
      width: 100%;
      height: 100%;
      min-height: 650px;
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

    @media (max-width: 1040px) {
      .auth-layout {
        grid-template-columns: 1fr;
      }

      .auth-visual img {
        min-height: 260px;
      }
    }
  `]
})
export class RegisterComponent {
  form: RegisterRequest = {
    fullName: '',
    email: '',
    password: '',
    phone: '',
    passportNumber: '',
    nationality: ''
  };
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit(): void {
    this.error = '';
    const payload = this.normalizedPayload();
    const validationError = this.validate(payload);

    if (validationError) {
      this.error = validationError;
      return;
    }

    this.loading = true;
    this.auth.register(payload).subscribe({
      next: () => this.router.navigate(['/flights']),
      error: (err) => {
        this.error = this.getErrorMessage(err);
        this.loading = false;
      }
    });
  }

  private normalizedPayload(): RegisterRequest {
    const digits = this.form.phone.replace(/\D/g, '');
    const phone = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;

    return {
      fullName: this.form.fullName.trim(),
      email: this.form.email.trim().toLowerCase(),
      password: this.form.password,
      phone,
      passportNumber: this.form.passportNumber.trim().toUpperCase(),
      nationality: this.form.nationality.trim()
    };
  }

  private validate(payload: RegisterRequest): string {
    if (payload.fullName.length < 3 || payload.fullName.length > 50) {
      return 'Full name must be between 3 and 50 characters.';
    }

    if (payload.password.length < 6) {
      return 'Password must be at least 6 characters.';
    }

    if (!/^[0-9]{10}$/.test(payload.phone)) {
      return 'Phone number must be exactly 10 digits. Example: 9777246800';
    }

    if (!/^[A-Z0-9]{6,9}$/.test(payload.passportNumber)) {
      return 'Passport number must be 6 to 9 uppercase letters or digits.';
    }

    return '';
  }

  private getErrorMessage(err: any): string {
    if (err?.error?.message) {
      return err.error.message;
    }

    if (typeof err?.error === 'string' && err.error.trim()) {
      return err.error;
    }

    if (err?.status === 0) {
      return 'Cannot reach backend. Start the API Gateway on port 8080 and check CORS.';
    }

    if (err?.status === 500) {
      return 'Registration failed on the backend. Check if MySQL is running, flight_auth database exists, and this email is not already registered.';
    }

    return 'Registration failed. Please check the form values and try again.';
  }
}
