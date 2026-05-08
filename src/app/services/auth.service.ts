import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '../models/models';

const API_URL = 'http://localhost:8080';
const STORAGE_KEY = 'skybooker_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.readStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    window.addEventListener('beforeunload', () => {
      this.logout();
    });
  }

  get currentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, payload).pipe(
      switchMap((user) => this.loadAndStoreProfile({ ...user, email: payload.email }))
    );
  }

  loginWithGoogle(): void {
    window.location.href = 'http://localhost:8081/oauth2/authorization/google';
  }

  consumeOAuthToken(token: string): Observable<AuthResponse> {
    const decoded = this.decodeJwtPayload(token);
    const role = String(decoded?.['role'] ?? 'PASSENGER');
    const userId = Number(decoded?.['userId'] ?? decoded?.['user_id'] ?? 0);
    const subject = decoded?.['sub'];
    const email = typeof subject === 'string' ? subject : undefined;

    return this.loadAndStoreProfile({
      token,
      role,
      userId,
      email
    });
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/register`, payload).pipe(
      tap((user) => this.storeUser({ ...user, email: payload.email, fullName: payload.fullName }))
    );
  }

  profile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${API_URL}/auth/profile`);
  }

  requestForgotPasswordOtp(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API_URL}/auth/password/forgot/request-otp`, { email });
  }

  verifyForgotPasswordOtp(email: string, otp: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API_URL}/auth/password/forgot/verify-otp`, { email, otp });
  }

  resetPasswordWithOtp(
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API_URL}/auth/password/forgot/reset`, {
      email,
      otp,
      newPassword,
      confirmPassword
    });
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    this.currentUserSubject.next(null);
  }

  refreshStoredProfile(): void {
    if (!this.currentUser || this.currentUser.fullName) {
      return;
    }

    this.loadAndStoreProfile(this.currentUser).subscribe();
  }

  private storeUser(user: AuthResponse): void {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadAndStoreProfile(user: AuthResponse): Observable<AuthResponse> {
    this.storeUser(user);

    return this.profile().pipe(
      tap((profile) => this.storeUser({
        ...user,
        fullName: profile.fullName,
        email: profile.email
      })),
      switchMap(() => new Observable<AuthResponse>((subscriber) => {
        subscriber.next(this.currentUserSubject.value as AuthResponse);
        subscriber.complete();
      }))
    );
  }

  private readStoredUser(): AuthResponse | null {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as AuthResponse : null;
  }

  private decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;

      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(normalized)
          .split('')
          .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
          .join('')
      );

      return JSON.parse(json) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}
