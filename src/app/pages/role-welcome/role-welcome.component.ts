import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-role-welcome',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page hero-wrap">
      <div class="hero-content">
        <img
          class="hero-image"
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1400&q=80"
          alt="Aircraft on runway"
        >

        <div class="hero-text">
          <h1>Welcome {{ displayName }}</h1>
          <p>You are logged in as {{ roleLabel }}.</p>
          <p class="muted">Open your {{ roleLabel }} panel to continue managing operations.</p>

          <div class="actions-row">
            <a *ngIf="isAdmin" class="btn primary" routerLink="/admin">Open Admin Panel</a>
            <a *ngIf="isStaff" class="btn primary" routerLink="/staff">Open Staff Panel</a>
            <button class="btn logout-btn" type="button" (click)="logout()">Logout</button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-wrap {
      padding-top: 24px;
    }

    .hero-content {
      display: grid;
      grid-template-columns: minmax(280px, 1fr) minmax(320px, 1fr);
      gap: 22px;
      align-items: stretch;
    }

    .hero-image {
      width: 100%;
      height: 100%;
      min-height: 320px;
      max-height: 420px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid #d9e3f0;
    }

    .hero-text {
      border: 1px solid #d9e3f0;
      border-radius: 8px;
      background: linear-gradient(180deg, #f9fbff 0%, #eef4ff 100%);
      padding: 30px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .hero-text h1 {
      margin-bottom: 8px;
    }

    .actions-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 18px;
    }

    .logout-btn {
      background: #d92d20;
      color: #ffffff;
      border: 1px solid #d92d20;
      transition: transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease;
      box-shadow: 0 8px 18px rgba(217, 45, 32, 0.28);
      animation: pulseRed 2.2s ease-in-out infinite;
    }

    .logout-btn:hover {
      background: #b42318;
      border-color: #b42318;
      transform: translateY(-1px) scale(1.02);
      box-shadow: 0 12px 22px rgba(180, 35, 24, 0.32);
    }

    .logout-btn:active {
      transform: scale(0.98);
    }

    @keyframes pulseRed {
      0% {
        box-shadow: 0 8px 18px rgba(217, 45, 32, 0.24);
      }
      50% {
        box-shadow: 0 10px 24px rgba(217, 45, 32, 0.38);
      }
      100% {
        box-shadow: 0 8px 18px rgba(217, 45, 32, 0.24);
      }
    }

    @media (max-width: 900px) {
      .hero-content {
        grid-template-columns: 1fr;
      }

      .hero-image {
        max-height: 260px;
      }
    }
  `]
})
export class RoleWelcomeComponent {
  constructor(private auth: AuthService, private router: Router) {}

  get isAdmin(): boolean {
    return this.auth.currentUser?.role === 'ADMIN';
  }

  get isStaff(): boolean {
    return this.auth.currentUser?.role === 'STAFF';
  }

  get roleLabel(): string {
    return this.isAdmin ? 'Admin' : this.isStaff ? 'Staff' : 'User';
  }

  get displayName(): string {
    return this.auth.currentUser?.fullName || this.auth.currentUser?.email || this.roleLabel;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/home']);
  }
}
