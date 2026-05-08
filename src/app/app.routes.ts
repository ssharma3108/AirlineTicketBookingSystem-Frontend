import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'oauth-success',
    loadComponent: () => import('./pages/oauth-success/oauth-success.component').then(m => m.OauthSuccessComponent)
  },
  {
    path: 'flights',
    loadComponent: () => import('./pages/flights/flights.component').then(m => m.FlightsComponent)
  },
  {
    path: 'booking/:flightId',
    loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent),
    canActivate: [authGuard]
  },
  {
    path: 'passengers/:bookingId',
    loadComponent: () => import('./pages/passengers/passengers.component').then(m => m.PassengersComponent),
    canActivate: [authGuard]
  },
  {
    path: 'payment/:bookingId',
    loadComponent: () => import('./pages/payment/payment.component').then(m => m.PaymentComponent),
    canActivate: [authGuard]
  },
  {
    path: 'my-bookings',
    loadComponent: () => import('./pages/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard]
  },
  {
    path: 'staff',
    loadComponent: () => import('./pages/staff/staff.component').then(m => m.StaffComponent),
    canActivate: [authGuard]
  },
  {
    path: 'role-welcome',
    loadComponent: () => import('./pages/role-welcome/role-welcome.component').then(m => m.RoleWelcomeComponent),
    canActivate: [authGuard]
  },

  { path: '**', redirectTo: '/home' }
];
