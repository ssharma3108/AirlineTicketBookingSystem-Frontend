import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SkybookerApiService } from '../../services/skybooker-api.service';
import {
  AdminUserUpdate,
  AirlineRequest,
  AirportRequest,
  BookingResponse,
  Flight,
  FlightRequest,
  UserProfile
} from '../../models/models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  tab: 'dashboard' | 'airline' | 'airport' | 'airlines' | 'airports' | 'flights' | 'users' | 'staff' | 'bookings' = 'dashboard';

  users: UserProfile[] = [];
  bookings: BookingResponse[] = [];
  flights: Flight[] = [];
  airlines: AirlineRequest[] = [];
  airports: AirportRequest[] = [];
  airportsCount = 0;

  editingUser: (AdminUserUpdate & { userId: number }) | null = null;
  editingFlight: (FlightRequest & { id: number }) | null = null;

  message = '';
  error = '';
  loading = false;
  minDateTime = this.toInputDateTime(new Date());

  airline: AirlineRequest = {
    name: '',
    iataCode: '',
    icaoCode: '',
    logoUrl: '',
    country: '',
    contactEmail: '',
    contactPhone: '',
    isActive: true
  };

  airport: AirportRequest = {
    name: '',
    iataCode: '',
    icaoCode: '',
    city: '',
    country: '',
    latitude: 0,
    longitude: 0,
    timezone: 'Asia/Kolkata'
  };

  constructor(private auth: AuthService, private api: SkybookerApiService) {}

  ngOnInit(): void {
    if (this.isAdmin) {
      this.loadUsers();
      this.loadFlights();
      this.loadBookings();
      this.loadAirlines();
      this.loadAirports();
      this.loadAirportCount();
    }
  }

  get role(): string | undefined {
    return this.auth.currentUser?.role;
  }

  get isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  get visibleUsers(): UserProfile[] {
    const role = this.tab === 'staff' ? 'STAFF' : 'PASSENGER';
    return this.users.filter((u) => u.role === role);
  }

  get adminName(): string {
    return this.auth.currentUser?.fullName || 'Admin';
  }

  get totalUsers(): number {
    return this.users.filter((u) => u.role === 'PASSENGER').length;
  }

  get totalStaff(): number {
    return this.users.filter((u) => u.role === 'STAFF').length;
  }

  get totalAirlines(): number {
    return this.airlines.length;
  }

  openDashboard(): void {
    this.tab = 'dashboard';
    this.clearMessage();
    this.loadUsers();
    this.loadFlights();
    this.loadAirportCount();
  }

  openAirline(): void { this.tab = 'airline'; this.clearMessage(); }
  openAirport(): void { this.tab = 'airport'; this.clearMessage(); }
  openAirlines(): void { this.tab = 'airlines'; this.clearMessage(); this.loadAirlines(); }
  openAirports(): void { this.tab = 'airports'; this.clearMessage(); this.loadAirports(); }
  openFlights(): void { this.tab = 'flights'; this.clearMessage(); this.loadFlights(); }
  openUsers(): void { this.tab = 'users'; this.clearMessage(); this.loadUsers(); }
  openStaff(): void { this.tab = 'staff'; this.clearMessage(); this.loadUsers(); }
  openBookings(): void {
    this.tab = 'bookings';
    this.clearMessage();
    this.loadUsers();
    this.loadFlights();
    this.loadBookings();
  }

  // Safe booking helpers (avoid template type errors)
  getBookingUserId(booking: BookingResponse): number | null {
    const b = booking as any;
    return typeof b.userId === 'number' ? b.userId : null;
  }

  getBookingFlightId(booking: BookingResponse): number | null {
    const b = booking as any;
    return typeof b.flightId === 'number' ? b.flightId : null;
  }

  getUserNameByBooking(booking: BookingResponse): string {
    const userId = this.getBookingUserId(booking);
    if (!userId) return '-';
    return this.users.find((u) => u.userId === userId)?.fullName ?? `User ${userId}`;
  }

  getFlightNameByBooking(booking: BookingResponse): string {
    const flightId = this.getBookingFlightId(booking);
    if (!flightId) return '-';
    const flight = this.flights.find((f) => f.id === flightId);
    return flight?.flightNumber ?? `Flight ${flightId}`;
  }

  getFlightTimeByBooking(booking: BookingResponse): string {
    const flightId = this.getBookingFlightId(booking);
    if (!flightId) return '-';
    const flight = this.flights.find((f) => f.id === flightId);
    return flight?.departureTime ? new Date(flight.departureTime).toLocaleString() : '-';
  }

  loadUsers(): void {
    this.api.getAllUsers().subscribe({
      next: (data) => (this.users = data),
      error: (err) => (this.error = this.describeError('Could not load users', err))
    });
  }

  loadFlights(): void {
    this.api.getAllFlights().subscribe({
      next: (data) => (this.flights = data),
      error: (err) => (this.error = this.describeError('Could not load flights', err))
    });
  }

  loadBookings(): void {
    this.api.getAllBookings().subscribe({
      next: (data) => (this.bookings = data),
      error: (err) => (this.error = this.describeError('Could not load bookings', err))
    });
  }

  loadAirportCount(): void {
    this.api.getAllAirports().subscribe({
      next: (data) => (this.airportsCount = data?.length ?? 0),
      error: () => (this.airportsCount = 0)
    });
  }

  loadAirlines(): void {
    this.api.getAllAirlines().subscribe({
      next: (data) => (this.airlines = data ?? []),
      error: () => (this.airlines = [])
    });
  }

  loadAirports(): void {
    this.api.getAllAirports().subscribe({
      next: (data) => (this.airports = data ?? []),
      error: () => (this.airports = [])
    });
  }

  createAirline(): void {
    this.loading = true;
    this.clearMessage();

    this.api.createAirline({
      ...this.airline,
      name: this.airline.name.trim(),
      iataCode: this.airline.iataCode.trim().toUpperCase(),
      icaoCode: this.airline.icaoCode.trim().toUpperCase(),
      country: this.airline.country.trim(),
      contactEmail: this.airline.contactEmail.trim(),
      contactPhone: this.airline.contactPhone.trim()
    }).subscribe({
      next: () => {
        this.message = 'Airline added.';
        this.loadAirlines();
        this.loading = false;
      },
      error: (err) => {
        this.error = this.describeError('Could not add airline', err);
        this.loading = false;
      }
    });
  }

  createAirport(): void {
    this.loading = true;
    this.clearMessage();

    this.api.createAirport({
      ...this.airport,
      name: this.airport.name.trim(),
      iataCode: this.airport.iataCode.trim().toUpperCase(),
      icaoCode: this.airport.icaoCode.trim().toUpperCase(),
      city: this.airport.city.trim(),
      country: this.airport.country.trim(),
      timezone: this.airport.timezone.trim(),
      latitude: Number(this.airport.latitude),
      longitude: Number(this.airport.longitude)
    }).subscribe({
      next: () => {
        this.message = 'Airport added.';
        this.loadAirports();
        this.loadAirportCount();
        this.loading = false;
      },
      error: (err) => {
        this.error = this.describeError('Could not add airport', err);
        this.loading = false;
      }
    });
  }

  startFlightEdit(f: Flight): void {
    this.editingFlight = {
      id: f.id,
      flightNumber: f.flightNumber,
      originAirportCode: f.originAirportCode,
      destinationAirportCode: f.destinationAirportCode,
      departureTime: this.toInputDateTime(new Date(f.departureTime)),
      arrivalTime: this.toInputDateTime(new Date(f.arrivalTime)),
      durationMinutes: f.durationMinutes,
      aircraftType: f.aircraftType,
      totalSeats: f.totalSeats,
      availableSeats: f.availableSeats,
      basePrice: f.basePrice,
      status: f.status,
      airlineId: f.airlineId
    };
  }

  saveFlight(): void {
    if (!this.editingFlight) return;
    const { id, ...payload } = this.editingFlight;
    this.api.updateFlight(id, payload).subscribe({
      next: () => {
        this.message = 'Flight updated.';
        this.editingFlight = null;
        this.loadFlights();
      },
      error: (err) => (this.error = this.describeError('Flight update failed', err))
    });
  }

  cancelFlightEdit(): void {
    this.editingFlight = null;
  }

  deleteFlight(id: number): void {
    if (!confirm('Delete flight?')) return;
    this.api.deleteFlight(id).subscribe({
      next: () => {
        this.message = 'Flight deleted.';
        this.loadFlights();
      },
      error: (err) => (this.error = this.describeError('Flight delete failed', err))
    });
  }

  startUserEdit(user: UserProfile): void {
    this.editingUser = {
      userId: user.userId,
      fullName: user.fullName,
      phone: user.phone,
      passportNumber: user.passportNumber,
      nationality: user.nationality,
      role: user.role
    };
  }

  saveUser(): void {
    if (!this.editingUser) return;
    const { userId, ...payload } = this.editingUser;
    this.api.updateUser(userId, payload).subscribe({
      next: () => {
        this.message = 'User updated.';
        this.editingUser = null;
        this.loadUsers();
      },
      error: (err) => (this.error = this.describeError('Update failed', err))
    });
  }

  cancelUserEdit(): void {
    this.editingUser = null;
  }

  deleteUser(id: number): void {
    if (!confirm('Delete user?')) return;
    this.api.deleteUser(id).subscribe({
      next: () => {
        this.message = 'User deleted.';
        this.loadUsers();
      },
      error: (err) => (this.error = this.describeError('Delete failed', err))
    });
  }

  cancelBooking(id: string): void {
    this.api.cancelBooking(id).subscribe({
      next: () => {
        this.message = 'Booking cancelled.';
        this.loadBookings();
      },
      error: (err) => (this.error = this.describeError('Cancel failed', err))
    });
  }

  deleteBooking(id: string): void {
    if (!confirm('Delete booking?')) return;
    this.api.deleteBooking(id).subscribe({
      next: () => {
        this.message = 'Booking deleted.';
        this.loadBookings();
      },
      error: (err) => (this.error = this.describeError('Delete failed', err))
    });
  }

  approveRefund(bookingId: string): void {
    this.api.approveRefund(bookingId).subscribe({
      next: () => {
        this.message = 'Refund approved.';
        this.loadBookings();
      },
      error: (err) => (this.error = this.describeError('Refund approval failed', err))
    });
  }

  rejectRefund(bookingId: string): void {
    this.api.rejectRefund(bookingId).subscribe({
      next: () => {
        this.message = 'Refund rejected.';
        this.loadBookings();
      },
      error: (err) => (this.error = this.describeError('Refund rejection failed', err))
    });
  }

  canResolveRefund(booking: BookingResponse): boolean {
    return (booking.refundStatus || '').toUpperCase() === 'REQUESTED';
  }

  getFlightDurationHours(flight: FlightRequest): string {
    const departure = new Date(flight.departureTime);
    const arrival = new Date(flight.arrivalTime);
    if (Number.isNaN(departure.getTime()) || Number.isNaN(arrival.getTime()) || arrival <= departure) return '';
    return ((arrival.getTime() - departure.getTime()) / 3600000).toFixed(2);
  }

  private toInputDateTime(date: Date): string {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  private clearMessage(): void {
    this.message = '';
    this.error = '';
  }

  private describeError(prefix: string, err: unknown): string {
    const e = err as { status?: number; error?: { message?: string } | string };
    if (e?.status === 0) return `${prefix}: backend unreachable.`;
    if (typeof e?.error === 'object' && e.error?.message) return `${prefix}: ${e.error.message}`;
    if (typeof e?.error === 'string' && e.error.trim()) return `${prefix}: ${e.error}`;
    if (e?.status) return `${prefix}: HTTP ${e.status}`;
    return `${prefix}.`;
  }
}
