import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthResponse } from './models/models';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="topbar">
      <a class="brand" routerLink="/home">
        <span class="brand-mark">
          <span class="plane-icon">✈</span>
          <span class="brand-text">SB</span>
        </span>
        <span>SkyBooker</span>
      </a>

      <nav class="nav">
        <a *ngIf="!isAdmin && !isStaff" routerLink="/home" routerLinkActive="active">Home</a>
        <a *ngIf="!isAdmin && !isStaff" routerLink="/flights" routerLinkActive="active">Flights</a>
        <a *ngIf="currentUser && !isAdmin && !isStaff" routerLink="/my-bookings" routerLinkActive="active">My Bookings</a>
        <a *ngIf="isAdmin" routerLink="/admin" routerLinkActive="active">Admin</a>
        <a *ngIf="isStaff" routerLink="/staff" routerLinkActive="active">Staff</a>
      </nav>

      <div class="actions">
        <ng-container *ngIf="currentUser; else loggedOut">
          <span class="user-chip">{{ displayName }}</span>
          <button class="btn small ghost top-logout-btn" type="button" (click)="logout()">Logout</button>
        </ng-container>
        <ng-template #loggedOut>
          <a class="btn small ghost" routerLink="/login">Login</a>
          <a class="btn small primary" routerLink="/register">Register</a>
        </ng-template>
      </div>
    </header>

    <main>
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent implements OnInit {
  currentUser: AuthResponse | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
    this.authService.refreshStoredProfile();
  }

  // ✅ keep only one
  get isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  get isStaff(): boolean {
    return this.currentUser?.role === 'STAFF';
  }

  get roleLabel(): string {
    if (this.isAdmin) {
      return 'Admin';
    }
    if (this.isStaff) {
      return 'Staff';
    }
    return 'User';
  }

  get displayName(): string {
    return this.currentUser?.fullName || this.currentUser?.email || this.roleLabel;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
