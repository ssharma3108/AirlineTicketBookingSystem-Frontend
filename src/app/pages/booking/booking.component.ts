import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingRequest, FareSummary, Flight, Seat } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { SkybookerApiService } from '../../services/skybooker-api.service';

@Component({
  standalone: true,
  selector: 'app-booking',
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page">
      <div class="page-title">
        <h1>Booking</h1>
        <p>Fill your details and continue to payment.</p>
      </div>

      <p *ngIf="loadingFlight" class="muted section">Loading flight details...</p>
      <p *ngIf="error" class="alert error">{{ error }}</p>

      <div class="grid two section">
        <article class="card section">
          <h3>Total Available Seats: {{ availableSeatCount }}</h3>

          <div class="seat-head">
            <span>A</span><span>B</span><span>C</span><span>D</span><span>E</span>
          </div>
          <div class="seat-grid" *ngIf="seats.length > 0">
            <ng-container *ngFor="let seat of seats">
              <button
                type="button"
                class="seat-btn"
                [class.business]="seatClassType(seat) === 'BUSINESS'"
                [class.economy]="seatClassType(seat) === 'ECONOMY'"
                [class.normal]="seatClassType(seat) === 'NORMAL'"
                [class.unavailable]="!isAvailable(seat)"
                [class.selected]="selectedSeatNumber === seat.seatNumber"
                [disabled]="!isAvailable(seat)"
                (click)="selectSeat(seat)">
                <span *ngIf="isAvailable(seat)">{{ seatLabel(seat) }}</span>
                <span *ngIf="!isAvailable(seat)" class="cross">x</span>
              </button>
            </ng-container>
          </div>
        </article>

        <form class="card section" (ngSubmit)="createBooking()">
          <div class="grid two">
            <div>
              <label>Seat class</label>
              <input name="seatClassDisplay" [value]="seatClassDisplay" readonly>
            </div>
            <div>
              <label>Trip type</label>
              <select name="tripType" [(ngModel)]="form.tripType" (ngModelChange)="loadFare()">
                <option value="ONE_WAY">One way</option>
                <option value="ROUND_TRIP">Round trip</option>
              </select>
            </div>
            <div>
              <label>Meal</label>
              <select name="mealPreference" [(ngModel)]="form.mealPreference" (ngModelChange)="loadFare()">
                <option value="NO_MEAL">No meal</option>
                <option value="VEG">Veg</option>
                <option value="NON_VEG">Non veg</option>
              </select>
            </div>
            <div>
              <label>Luggage kg</label>
              <input name="luggageKg" [(ngModel)]="form.luggageKg" type="number" min="0" (input)="loadFare()">
            </div>
            <div>
              <label>Email</label>
              <input name="contactEmail" [(ngModel)]="form.contactEmail" type="email" required>
            </div>
            <div>
              <label>Phone</label>
              <input name="contactPhone" [(ngModel)]="form.contactPhone" required>
            </div>
          </div>

          <div class="alert success">Estimated fare: {{ estimatedTotal | currency:'INR' }}</div>
          <p class="muted">Selected seat: <strong>{{ seatLabelFromValue(form.seatNumber) || '-' }}</strong></p>

          <button class="btn primary" type="submit" [disabled]="loading">
            {{ loading ? 'Creating...' : 'Continue to payment' }}
          </button>
        </form>
      </div>
    </section>
  `,
  styles: [`
    .seat-head {
      margin-top: 12px;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      color: #7084a2;
      font-weight: 700;
      text-align: center;
    }
    .seat-grid {
      margin-top: 8px;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }
    .seat-btn {
      min-height: 52px;
      border: 1px solid #c8d7ff;
      background: #eef2ff;
      border-radius: 8px;
      color: #16264a;
      font-weight: 700;
    }
    .seat-btn.business {
      background: #fff7ed;
      border-color: #fdba74;
      color: #9a3412;
    }
    .seat-btn.economy {
      background: #ecfeff;
      border-color: #67e8f9;
      color: #155e75;
    }
    .seat-btn.normal {
      background: #eef2ff;
      border-color: #c7d2fe;
      color: #1e3a8a;
    }
    .seat-btn.unavailable {
      background: #fee2e2;
      border-color: #fca5a5;
      color: #b91c1c;
      cursor: not-allowed;
    }
    .seat-btn.selected {
      background: #1769aa;
      color: #fff;
      border-color: #1769aa;
    }
    .cross { font-size: 22px; line-height: 1; font-weight: 800; }
  `]
})
export class BookingComponent implements OnInit, OnDestroy {
  private readonly seatRefreshMs = 12000;
  private seatRefreshTimer: ReturnType<typeof setInterval> | null = null;

  flightId = 0;
  flight?: Flight;
  seats: Seat[] = [];
  fare?: FareSummary;
  loadingFlight = false;
  loading = false;
  error = '';
  selectedSeatNumber = '';
  private bookedSeatNumbers = new Set<string>();

  form: BookingRequest = {
    userId: 0,
    flightId: 0,
    seatNumber: '',
    seatClass: 'NORMAL',
    tripType: 'ONE_WAY',
    mealPreference: 'NO_MEAL',
    luggageKg: 0,
    contactEmail: '',
    contactPhone: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private api: SkybookerApiService
  ) {}

  ngOnInit(): void {
    this.flightId = Number(this.route.snapshot.paramMap.get('flightId'));
    if (!this.flightId) {
      this.error = 'Invalid flight. Please select a flight again.';
      return;
    }

    this.form.flightId = this.flightId;
    this.form.userId = this.auth.currentUser?.userId ?? 0;
    this.form.contactEmail = this.auth.currentUser?.email ?? '';
    this.form.seatNumber = `N${this.flightId}`;
    this.selectedSeatNumber = this.form.seatNumber;

    this.loadingFlight = true;
    this.api.getFlight(this.flightId).subscribe({
      next: (flight) => {
        this.flight = flight;
        this.loadFare();
        this.loadSeats();
        this.startSeatAutoRefresh();
        this.loadingFlight = false;
      },
      error: () => {
        this.error = 'Could not load selected flight.';
        this.loadingFlight = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.stopSeatAutoRefresh();
  }

  get estimatedTotal(): number {
    return this.fare?.totalFare ?? this.flight?.basePrice ?? 0;
  }

  get availableSeatCount(): number {
    if (this.seats.length > 0) {
      return this.seats.filter((s) => this.isAvailable(s)).length;
    }
    return Math.max(this.flight?.availableSeats || 0, 0);
  }

  get seatClassDisplay(): string {
    const cls = (this.form.seatClass || 'NORMAL').toUpperCase();
    if (cls === 'BUSINESS' || cls === 'FIRST') return 'Business';
    if (cls === 'ECONOMY') return 'Economy';
    return 'Normal';
  }

  isAvailable(seat: Seat): boolean {
    return (seat.status || '').toUpperCase() === 'AVAILABLE';
  }

  seatClassType(seat: Seat): 'BUSINESS' | 'ECONOMY' | 'NORMAL' {
    const cls = (seat.seatClass || '').toUpperCase();
    if (cls === 'BUSINESS' || cls === 'FIRST') return 'BUSINESS';
    if (cls === 'ECONOMY') return 'ECONOMY';
    return 'NORMAL';
  }

  selectSeat(seat: Seat): void {
    this.selectedSeatNumber = seat.seatNumber;
    this.form.seatNumber = seat.seatNumber;
    this.form.seatClass = seat.seatClass || this.form.seatClass;
    this.loadFare();
  }

  private loadSeats(): void {
    this.api.getSeatsByFlight(this.flightId).subscribe({
      next: (seats) => {
        const allSeats = [...(seats || [])].sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));
        if (allSeats.length === 0) {
          this.seats = this.applyBookedSeatFilter(this.createFallbackSeatsFromFlight());
          this.loadBookedSeatsForFlight();
          return;
        }
        this.seats = this.applyBookedSeatFilter(allSeats.filter((s) => this.isAvailable(s)));
        this.loadBookedSeatsForFlight();

        if (this.seats.length === 0) {
          this.form.seatNumber = '';
          this.selectedSeatNumber = '';
        } else if (!this.seats.some((s) => s.seatNumber === this.form.seatNumber)) {
          this.selectedSeatNumber = this.seats[0].seatNumber;
          this.form.seatNumber = this.selectedSeatNumber;
          this.form.seatClass = this.seats[0].seatClass || this.form.seatClass;
          this.loadFare();
        }
      },
      error: () => {
        this.seats = this.applyBookedSeatFilter(this.createFallbackSeatsFromFlight());
        this.loadBookedSeatsForFlight();
      }
    });
  }

  private loadBookedSeatsForFlight(): void {
    this.api.getBookingsByFlight(this.flightId).subscribe({
      next: (bookings) => {
        this.bookedSeatNumbers.clear();
        for (const b of bookings || []) {
          const status = (b.status || '').toUpperCase();
          if (status === 'CANCELLED') continue;
          if (b.seatNumber) this.bookedSeatNumbers.add(String(b.seatNumber).toUpperCase());
        }
        this.seats = this.applyBookedSeatFilter(this.seats);
        if (this.form.seatNumber && !this.seats.some((s) => s.seatNumber === this.form.seatNumber)) {
          this.form.seatNumber = '';
          this.selectedSeatNumber = '';
        }
      },
      error: () => {}
    });
  }

  private applyBookedSeatFilter(source: Seat[]): Seat[] {
    if (!source.length || this.bookedSeatNumbers.size === 0) return source;
    return source.filter((s) => !this.bookedSeatNumbers.has((s.seatNumber || '').toUpperCase()));
  }

  private createFallbackSeatsFromFlight(): Seat[] {
    const cols = ['A', 'B', 'C', 'D', 'E'];
    const total = Math.max(this.flight?.availableSeats || this.flight?.totalSeats || 0, 0);
    const fallback: Seat[] = [];
    for (let i = 1; i <= total; i++) {
      const row = Math.ceil(i / cols.length);
      const col = cols[(i - 1) % cols.length];
      fallback.push({
        seatId: i,
        flightId: this.flightId,
        seatNumber: `${row}${col}`,
        seatClass: row <= 2 ? 'BUSINESS' : row <= 4 ? 'ECONOMY' : 'NORMAL',
        rowNumber: row,
        columnLetter: col,
        status: 'AVAILABLE'
      });
    }
    return fallback;
  }

  private startSeatAutoRefresh(): void {
    this.stopSeatAutoRefresh();
    this.seatRefreshTimer = setInterval(() => {
      if (!this.loading) {
        this.loadSeats();
      }
    }, this.seatRefreshMs);
  }

  private stopSeatAutoRefresh(): void {
    if (this.seatRefreshTimer) {
      clearInterval(this.seatRefreshTimer);
      this.seatRefreshTimer = null;
    }
  }

  seatLabel(seat: Seat): string {
    const raw = (seat.seatNumber || '').toUpperCase();
    const m = raw.match(/^(\d+)([A-Z])$/);
    if (m) {
      return `${m[2]}${m[1]}`;
    }
    return raw;
  }

  seatLabelFromValue(value: string): string {
    const raw = (value || '').toUpperCase();
    const m = raw.match(/^(\d+)([A-Z])$/);
    if (m) return `${m[2]}${m[1]}`;
    return raw;
  }

  loadFare(): void {
    this.api.calculateFare(
      this.flightId,
      Number(this.form.luggageKg) || 0,
      this.form.tripType,
      this.form.mealPreference,
      this.form.seatClass
    ).subscribe({
      next: (fare) => this.fare = fare,
      error: () => this.error = 'Could not estimate fare.'
    });
  }

  createBooking(): void {
    this.loading = true;
    this.error = '';
    if (!this.form.seatNumber?.trim()) {
      this.error = 'Please select a seat.';
      this.loading = false;
      return;
    }

    this.api.createBooking({
      ...this.form,
      luggageKg: Number(this.form.luggageKg) || 0
    }).subscribe({
      next: (booking) => {
        this.loading = false;
        this.router.navigate(['/payment', booking.bookingId]);
      },
      error: (err) => {
        this.error = err?.error?.message ? `Booking failed: ${err.error.message}` : 'Booking failed.';
        // Refresh map on failure so newly booked/held seats appear locked (red).
        this.loadSeats();
        this.loading = false;
      }
    });
  }
}
