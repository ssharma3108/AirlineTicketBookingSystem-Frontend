import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookingResponse } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { SkybookerApiService } from '../../services/skybooker-api.service';

@Component({
  standalone: true,
  selector: 'app-my-bookings',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="page-title">
        <h1>My Bookings</h1>
        <p>View bookings by user ID, search by PNR, and cancel bookings.</p>
      </div>

      <form class="card toolbar section" (ngSubmit)="findByPnr()">
        <div><label>User ID</label><input name="userId" [(ngModel)]="userId" type="number"></div>
        <div><label>PNR</label><input name="pnr" [(ngModel)]="pnr" placeholder="PNR code"></div>
        <div><label>Filter</label><select><option>All bookings</option></select></div>
        <div><label>Gateway</label><input value="localhost:8080" disabled></div>
        <button class="btn ghost" type="button" (click)="loadBookings()">Load</button>
        <button class="btn primary" type="submit">Find PNR</button>
      </form>

      <p *ngIf="message" class="alert success">{{ message }}</p>
      <p *ngIf="error" class="alert error">{{ error }}</p>

      <div class="card section table-wrap">
        <table>
          <thead>
            <tr>
              <th>PNR</th>
              <th>Booking ID</th>
              <th>Status</th>
              <th>Refund</th>
              <th>Total</th>
              <th>Seat</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let booking of bookings">
              <td><strong>{{ booking.pnrCode }}</strong></td>
              <td>{{ booking.bookingId }}</td>
              <td><span class="status" [ngClass]="statusClass(booking.status)">{{ booking.status }}</span></td>
              <td><span class="status" [ngClass]="refundClass(booking.refundStatus)">{{ booking.refundStatus || 'NON_REFUNDED' }}</span></td>
              <td>{{ booking.totalFare | currency:'INR' }}</td>
              <td>{{ booking.seatNumber || '-' }}</td>
              <td>
                <ng-container *ngIf="canPay(booking)">
                  <a class="btn small ghost" [routerLink]="['/payment', booking.bookingId]">Pay</a>
                  <button class="btn small danger" type="button" (click)="cancel(booking.bookingId)">Cancel</button>
                </ng-container>

                <button
                  *ngIf="canRequestRefund(booking)"
                  class="btn small ghost"
                  type="button"
                  [disabled]="refundInProgress[booking.bookingId]"
                  (click)="requestRefund(booking.bookingId)">
                  {{ refundInProgress[booking.bookingId] ? 'Refund in progress...' : 'Request Refund' }}
                </button>
              </td>
            </tr>
            <tr *ngIf="bookings.length === 0">
              <td colspan="7" class="muted">No bookings loaded.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class MyBookingsComponent implements OnInit, OnDestroy {
  bookings: BookingResponse[] = [];
  pnr = '';
  userId = 0;
  message = '';
  error = '';
  refundInProgress: Record<string, boolean> = {};
  private refundTimers: Record<string, ReturnType<typeof setTimeout>> = {};

  constructor(private auth: AuthService, private api: SkybookerApiService) {}

  ngOnInit(): void {
    this.userId = this.auth.currentUser?.userId ?? 0;
    this.loadBookings();
  }

  ngOnDestroy(): void {
    Object.values(this.refundTimers).forEach((timer) => clearTimeout(timer));
  }

  loadBookings(): void {
    this.message = '';
    this.error = '';
    this.api.getBookingsByUser(Number(this.userId)).subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.syncPendingStatuses();
      },
      error: () => (this.error = 'Could not load bookings for this user.')
    });
  }

  findByPnr(): void {
    if (!this.pnr.trim()) {
      this.loadBookings();
      return;
    }

    this.api.getBookingByPnr(this.pnr.trim()).subscribe({
      next: (booking) => {
        this.bookings = [booking];
        this.message = 'Booking found.';
        this.syncPendingStatuses();
      },
      error: () => (this.error = 'No booking found for this PNR.')
    });
  }

  cancel(bookingId: string): void {
    this.api.cancelBooking(bookingId).subscribe({
      next: () => {
        this.message = 'Booking cancelled.';
        this.loadBookings();
      },
      error: () => (this.error = 'Could not cancel booking.')
    });
  }

  statusClass(status: string): string {
    if (status === 'CONFIRMED' || status === 'PAID') return 'ok';
    if (status === 'CANCELLED') return 'bad';
    return 'warn';
  }

  canPay(booking: BookingResponse): boolean {
    const status = (booking.status || '').toUpperCase();
    return status === 'PENDING' || status === 'FAILED';
  }

  canRequestRefund(booking: BookingResponse): boolean {
    const status = (booking.status || '').toUpperCase();
    const refundStatus = (booking.refundStatus || 'NON_REFUNDED').toUpperCase();
    return status === 'CONFIRMED' && (refundStatus === 'NON_REFUNDED' || refundStatus === 'REJECTED');
  }

  requestRefund(bookingId: string): void {
    if (this.refundInProgress[bookingId]) return;

    this.message = '';
    this.error = '';
    this.refundInProgress[bookingId] = true;

    this.ensureConfirmedIfPaid(bookingId, () => {
      this.tryRefundRequest(bookingId);
    });
  }

  refundClass(status?: string): string {
    const value = (status || 'NON_REFUNDED').toUpperCase();
    if (value === 'REFUNDED') return 'ok';
    if (value === 'REQUESTED') return 'warn';
    if (value === 'REJECTED') return 'bad';
    return 'muted';
  }

  private onRefundRequested(bookingId: string): void {
    window.alert('After 2 min your amount will be refunded.');
    this.message = 'Refund requested. Please wait 2 minutes for completion.';
    this.startRefundTimer(bookingId);
    const row = this.bookings.find((b) => b.bookingId === bookingId);
    if (row) row.refundStatus = 'REQUESTED';
  }

  private startRefundTimer(bookingId: string): void {
    if (this.refundTimers[bookingId]) clearTimeout(this.refundTimers[bookingId]);
    this.refundTimers[bookingId] = setTimeout(() => this.autoCompleteRefund(bookingId), 120000);
  }

  private autoCompleteRefund(bookingId: string): void {
    this.api.approveRefund(bookingId).subscribe({
      next: () => this.onRefundCompleted(bookingId),
      error: () => {
        this.api.approveRefundDirect(bookingId).subscribe({
          next: () => this.onRefundCompleted(bookingId),
          error: () => {
            this.error = 'Refund requested, but auto completion failed. Please contact admin.';
            this.refundInProgress[bookingId] = false;
            delete this.refundTimers[bookingId];
          }
        });
      }
    });
  }

  private onRefundCompleted(bookingId: string): void {
    this.message = 'Refund completed. Booking is cancelled.';
    this.refundInProgress[bookingId] = false;
    delete this.refundTimers[bookingId];
    const row = this.bookings.find((b) => b.bookingId === bookingId);
    if (row) {
      row.status = 'CANCELLED';
      row.refundStatus = 'REFUNDED';
    }
    this.loadBookings();
  }

  private syncPendingStatuses(): void {
    for (const booking of this.bookings) {
      if ((booking.status || '').toUpperCase() !== 'PENDING') continue;
      this.api.getPaymentsByBooking(booking.bookingId).subscribe({
        next: (payments) => {
          const paid = payments?.some((payment) => (payment.status || '').toUpperCase() === 'PAID');
          if (!paid) return;
          booking.status = 'CONFIRMED';
          this.api.updateBookingStatus(booking.bookingId, 'CONFIRMED').subscribe({ next: () => {}, error: () => {} });
        },
        error: () => {}
      });
    }
  }

  private ensureConfirmedIfPaid(bookingId: string, nextStep: () => void): void {
    const row = this.bookings.find((b) => b.bookingId === bookingId);
    const currentStatus = (row?.status || '').toUpperCase();
    if (currentStatus === 'CONFIRMED') {
      nextStep();
      return;
    }

    this.api.getPaymentsByBooking(bookingId).subscribe({
      next: (payments) => {
        const paid = payments?.some((payment) => (payment.status || '').toUpperCase() === 'PAID');
        if (!paid) {
          nextStep();
          return;
        }

        this.api.updateBookingStatus(bookingId, 'CONFIRMED').subscribe({
          next: () => {
            if (row) row.status = 'CONFIRMED';
            nextStep();
          },
          error: () => {
            nextStep();
          }
        });
      },
      error: () => {
        nextStep();
      }
    });
  }

  private tryRefundRequest(bookingId: string): void {
    this.api.requestRefund(bookingId).subscribe({
      next: () => this.onRefundRequested(bookingId),
      error: () => {
        this.api.requestRefundPost(bookingId).subscribe({
          next: () => this.onRefundRequested(bookingId),
          error: () => {
            this.api.requestRefundDirect(bookingId).subscribe({
              next: () => this.onRefundRequested(bookingId),
              error: () => {
                this.api.requestRefundDirectPost(bookingId).subscribe({
                  next: () => this.onRefundRequested(bookingId),
                  error: (finalErr) => {
                    this.api.requestRefundDirectAlt(bookingId).subscribe({
                      next: () => this.onRefundRequested(bookingId),
                      error: (lastErr) => {
                        const message =
                          lastErr?.error?.message ||
                          lastErr?.error?.error ||
                          (typeof lastErr?.error === 'string' ? lastErr.error : '') ||
                          '';
                        const status = lastErr?.status ? ` (HTTP ${lastErr.status})` : '';
                        this.error = message
                          ? `Could not send refund request: ${message}${status}`
                          : `Could not send refund request.${status}`;
                        this.refundInProgress[bookingId] = false;
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  }
}
