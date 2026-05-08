import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookingResponse, Flight, FlightRequest, UserProfile } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { SkybookerApiService } from '../../services/skybooker-api.service';

@Component({
  standalone: true,
  selector: 'app-staff',
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page">
      <div class="page-title">
        <h1>Staff</h1>
        <p>Create flights and view users, flights, and bookings.</p>
      </div>

      <p *ngIf="!isStaff" class="alert error">
        Your current role is {{ role || 'unknown' }}. This interface is only for STAFF users.
      </p>

      <div class="card section" *ngIf="isStaff">
        <div class="tabs">
          <button class="btn small" [class.primary]="tab === 'create-flight'" (click)="tab='create-flight'">Create Flight</button>
          <button class="btn small" [class.primary]="tab === 'users'" (click)="tab='users'; loadUsers()">Users</button>
          <button class="btn small" [class.primary]="tab === 'flights'" (click)="tab='flights'; loadFlights()">Flights</button>
          <button class="btn small" [class.primary]="tab === 'bookings'" (click)="tab='bookings'; loadBookings()">Bookings</button>
        </div>
      </div>

      <form *ngIf="isStaff && tab === 'create-flight'" class="card section" (ngSubmit)="createFlight()">
        <h3>Create flight</h3>
        <div class="grid three section">
          <div><label>Flight number</label><input name="flightNumber" [(ngModel)]="flight.flightNumber" required></div>
          <div><label>Origin airport code</label><input name="originAirportCode" [(ngModel)]="flight.originAirportCode" required></div>
          <div><label>Destination airport code</label><input name="destinationAirportCode" [(ngModel)]="flight.destinationAirportCode" required></div>
          <div><label>Departure date and time</label><input name="departureTime" [(ngModel)]="flight.departureTime" type="datetime-local" [min]="minDateTime" required></div>
          <div><label>Arrival date and time</label><input name="arrivalTime" [(ngModel)]="flight.arrivalTime" type="datetime-local" [min]="flight.departureTime || minDateTime" required></div>
          <div><label>Duration hours</label><input name="durationHours" [value]="durationHours" disabled></div>
          <div><label>Aircraft type</label><input name="aircraftType" [(ngModel)]="flight.aircraftType" required></div>
          <div><label>Total seats</label><input name="totalSeats" [(ngModel)]="flight.totalSeats" type="number" min="1" required></div>
          <div><label>Available seats</label><input name="availableSeats" [(ngModel)]="flight.availableSeats" type="number" min="0" required></div>
          <div><label>Base price</label><input name="basePrice" [(ngModel)]="flight.basePrice" type="number" min="1" required></div>
          <div>
            <label>Status</label>
            <select name="status" [(ngModel)]="flight.status">
              <option>ON_TIME</option>
              <option>DELAYED</option>
              <option>CANCELLED</option>
              <option>DEPARTED</option>
              <option>ARRIVED</option>
            </select>
          </div>
          <div><label>Airline ID</label><input name="airlineId" [(ngModel)]="flight.airlineId" type="number" min="1" required></div>
        </div>

        <p class="muted">Departure date and time cannot be before now. Arrival date and time must be after departure date and time.</p>
        <p *ngIf="message" class="alert success">{{ message }}</p>
        <p *ngIf="error" class="alert error">{{ error }}</p>
        <button class="btn primary section" type="submit" [disabled]="loading">{{ loading ? 'Creating...' : 'Create flight' }}</button>
      </form>

      <section *ngIf="isStaff && tab === 'users'" class="card section table-wrap">
        <h3>Users</h3>
        <p *ngIf="error" class="alert error">{{ error }}</p>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Nationality</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let user of passengerUsers">
              <td>{{ user.userId }}</td>
              <td>{{ user.fullName }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.phone }}</td>
              <td><span class="status ok">{{ user.role }}</span></td>
              <td>{{ user.nationality }}</td>
            </tr>

            <tr *ngIf="passengerUsers.length === 0">
              <td colspan="6" class="muted">No users loaded.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section *ngIf="isStaff && tab === 'flights'" class="card section table-wrap">
        <h3>Flights</h3>
        <p *ngIf="error" class="alert error">{{ error }}</p>

        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>From</th>
              <th>To</th>
              <th>Departure</th>
              <th>Arrival</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Seats</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let item of flights">
              <td><strong>{{ item.flightNumber }}</strong></td>
              <td>{{ item.originAirportCode }}</td>
              <td>{{ item.destinationAirportCode }}</td>
              <td>{{ item.departureTime | date:'medium' }}</td>
              <td>{{ item.arrivalTime | date:'medium' }}</td>
              <td>{{ (item.durationMinutes / 60) | number:'1.2-2' }} hrs</td>
              <td><span class="status warn">{{ item.status }}</span></td>
              <td>{{ item.availableSeats }}/{{ item.totalSeats }}</td>
            </tr>

            <tr *ngIf="flights.length === 0">
              <td colspan="8" class="muted">No flights loaded.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section *ngIf="isStaff && tab === 'bookings'" class="card section table-wrap">
        <h3>Bookings</h3>
        <p *ngIf="error" class="alert error">{{ error }}</p>

        <table>
          <thead>
            <tr>
              <th>PNR</th>
              <th>Booking ID</th>
              <th>User Name</th>
              <th>User ID</th>
              <th>Route</th>
              <th>Total</th>
              <th>Seat</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let booking of bookings">
              <td><strong>{{ booking.pnrCode }}</strong></td>
              <td>{{ booking.bookingId }}</td>
              <td>{{ getUserNameByBooking(booking) }}</td>
              <td>{{ getBookingUserId(booking) || '-' }}</td>
              <td>{{ getRouteByBooking(booking) }}</td>
              <td>{{ booking.totalFare | currency:'INR' }}</td>
              <td>{{ booking.seatNumber || '-' }}</td>
            </tr>

            <tr *ngIf="bookings.length === 0">
              <td colspan="7" class="muted">No bookings loaded.</td>
            </tr>
          </tbody>
        </table>
      </section>
    </section>
  `,
  styles: [`
    .tabs {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
  `]
})
export class StaffComponent implements OnInit {
  tab: 'create-flight' | 'users' | 'flights' | 'bookings' = 'create-flight';

  users: UserProfile[] = [];
  bookings: BookingResponse[] = [];
  flights: Flight[] = [];

  loading = false;
  message = '';
  error = '';
  minDateTime = this.toInputDateTime(new Date());

  flight: FlightRequest = this.emptyFlight();

  constructor(private auth: AuthService, private api: SkybookerApiService) {}

  ngOnInit(): void {
    if (this.isStaff) {
      this.loadUsers();
      this.loadFlights();
      this.loadBookings();
    }
  }

  get role(): string | undefined {
    return this.auth.currentUser?.role;
  }

  get isStaff(): boolean {
    return this.role === 'STAFF';
  }

  get passengerUsers(): UserProfile[] {
    return this.users.filter((u) => u.role === 'PASSENGER');
  }

  get durationHours(): string {
    const minutes = this.getDurationMinutes(this.flight);
    return minutes ? (minutes / 60).toFixed(2) : '';
  }

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

  getRouteByBooking(booking: BookingResponse): string {
    const flightId = this.getBookingFlightId(booking);
    if (!flightId) return '-';
    const flight = this.flights.find((f) => f.id === flightId);
    if (!flight) return `Flight ${flightId}`;
    return `${flight.originAirportCode} -> ${flight.destinationAirportCode}`;
  }

  createFlight(): void {
    this.message = '';
    this.error = '';

    const validationError = this.validateFlightValues(this.flight);
    if (validationError) {
      this.error = validationError;
      return;
    }

    this.loading = true;
    this.api.createFlight(this.prepareFlightValues(this.flight)).subscribe({
      next: () => {
        this.message = 'Flight created.';
        this.flight = this.emptyFlight();
        this.loading = false;
        this.loadFlights();
      },
      error: (err: unknown) => {
        this.error = this.describeError('Could not create flight', err);
        this.loading = false;
      }
    });
  }

  loadUsers(): void {
    this.api.getAllUsers().subscribe({
      next: (data) => this.users = data,
      error: (err: unknown) => this.error = this.describeError('Could not load users', err)
    });
  }

  loadBookings(): void {
    this.api.getAllBookings().subscribe({
      next: (data) => this.bookings = data,
      error: (err: unknown) => this.error = this.describeError('Could not load bookings', err)
    });
  }

  loadFlights(): void {
    this.api.getAllFlights().subscribe({
      next: (data) => this.flights = data,
      error: (err: unknown) => this.error = this.describeError('Could not load flights', err)
    });
  }

  private validateFlightValues(flight: FlightRequest): string {
    const departure = new Date(flight.departureTime);
    const arrival = new Date(flight.arrivalTime);
    const now = new Date();

    if (Number.isNaN(departure.getTime()) || Number.isNaN(arrival.getTime())) {
      return 'Select valid departure and arrival date and time.';
    }

    if (departure.getTime() < now.getTime() - 60000) {
      return 'Departure date and time cannot be before now.';
    }

    if (arrival.getTime() <= departure.getTime()) {
      return 'Arrival date and time must be after departure date and time.';
    }

    if (Number(flight.availableSeats) > Number(flight.totalSeats)) {
      return 'Available seats cannot be greater than total seats.';
    }

    return '';
  }

  private prepareFlightValues(flight: FlightRequest): FlightRequest {
    return {
      ...flight,
      departureTime: this.toBackendDateTime(flight.departureTime),
      arrivalTime: this.toBackendDateTime(flight.arrivalTime),
      durationMinutes: this.getDurationMinutes(flight),
      totalSeats: Number(flight.totalSeats),
      availableSeats: Number(flight.availableSeats),
      basePrice: Number(flight.basePrice),
      airlineId: Number(flight.airlineId),
      flightNumber: flight.flightNumber.trim().toUpperCase(),
      originAirportCode: flight.originAirportCode.trim().toUpperCase(),
      destinationAirportCode: flight.destinationAirportCode.trim().toUpperCase(),
      aircraftType: flight.aircraftType.trim()
    };
  }

  private getDurationMinutes(flight: FlightRequest): number {
    const departure = new Date(flight.departureTime);
    const arrival = new Date(flight.arrivalTime);

    if (Number.isNaN(departure.getTime()) || Number.isNaN(arrival.getTime()) || arrival <= departure) {
      return 0;
    }

    return Math.round((arrival.getTime() - departure.getTime()) / 60000);
  }

  private toBackendDateTime(value: string): string {
    return value.length === 16 ? `${value}:00` : value;
  }

  private toInputDateTime(date: Date): string {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  private describeError(prefix: string, err: unknown): string {
    const error = err as { status?: number; error?: { message?: string } | string };
    if (typeof error.error === 'object' && error.error?.message) return `${prefix}: ${error.error.message}`;
    if (typeof error.error === 'string' && error.error.trim()) return `${prefix}: ${error.error}`;
    if (error.status) return `${prefix}: HTTP ${error.status}`;
    return `${prefix}.`;
  }

  private emptyFlight(): FlightRequest {
    return {
      flightNumber: '',
      originAirportCode: '',
      destinationAirportCode: '',
      departureTime: '',
      arrivalTime: '',
      durationMinutes: 120,
      aircraftType: '',
      totalSeats: 180,
      availableSeats: 180,
      basePrice: 5000,
      status: 'ON_TIME',
      airlineId: 1
    };
  }
}
