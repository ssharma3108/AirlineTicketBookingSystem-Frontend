import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingResponse, PaymentResponse, RazorpayOrderResponse } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { SkybookerApiService } from '../../services/skybooker-api.service';

declare global {
  interface Window {
    Razorpay: any;
  }
}

@Component({
  standalone: true,
  selector: 'app-payment',
  imports: [CommonModule],
  template: `
    <section class="page">
      <div class="page-title">
        <h1>Check details</h1>
        <p>Confirm your booking details before payment.</p>
      </div>

      <div class="details-panel section" *ngIf="booking; else loadingBooking">
        <h3>Booking details</h3>

        <div class="detail-row">
          <span>Current status</span>
          <strong><span class="status warn">{{ booking.status }}</span></strong>
        </div>

        <div class="detail-row">
          <span>PNR</span>
          <strong>{{ booking.pnrCode }}</strong>
        </div>

        <div class="detail-row">
          <span>Booking ID</span>
          <strong>{{ booking.bookingId }}</strong>
        </div>

        <div class="detail-row">
          <span>Seat</span>
          <strong>{{ booking.seatNumber || '-' }}</strong>
        </div>

        <div class="detail-row total">
          <span>Total payable</span>
          <strong>{{ booking.totalFare | currency:'INR' }}</strong>
        </div>

        <p *ngIf="message" class="alert success">{{ message }}</p>
        <p *ngIf="error" class="alert error">{{ error }}</p>

        <button class="btn primary pay-button" type="button" [disabled]="loading" (click)="payNow()">
          {{ loading ? 'Opening Razorpay...' : 'Pay now' }}
        </button>
      </div>

      <ng-template #loadingBooking>
        <p class="muted section">Loading booking details...</p>
        <p *ngIf="error" class="alert error">{{ error }}</p>
      </ng-template>

      <article class="details-panel section" *ngIf="payment">
        <h3>Payment result</h3>
        <div class="detail-row">
          <span>Payment ID</span>
          <strong>{{ payment.paymentId }}</strong>
        </div>
        <div class="detail-row">
          <span>Transaction ID</span>
          <strong>{{ payment.transactionId }}</strong>
        </div>
        <div class="detail-row">
          <span>Status</span>
          <strong><span class="status ok">{{ payment.status }}</span></strong>
        </div>
      </article>
    </section>
  `,
  styles: [`
    .details-panel {
      max-width: 760px;
      border-top: 1px solid #d8e2f0;
      border-bottom: 1px solid #d8e2f0;
      padding: 26px 0;
    }

    .detail-row {
      display: grid;
      grid-template-columns: minmax(160px, 240px) 1fr;
      gap: 18px;
      padding: 14px 0;
      border-bottom: 1px solid #e6edf7;
      align-items: center;
    }

    .detail-row span {
      color: #526989;
    }

    .detail-row strong {
      color: #071b3a;
      word-break: break-word;
    }

    .detail-row.total {
      font-size: 1.1rem;
      border-bottom: 0;
    }

    .pay-button {
      margin-top: 20px;
    }
  `]
})
export class PaymentComponent implements OnInit {
  bookingId = '';
  booking?: BookingResponse;
  payment?: PaymentResponse;
  loading = false;
  message = '';
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private api: SkybookerApiService
  ) {}

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('bookingId') ?? '';
    this.loadBooking();
  }

  payNow(): void {
    if (!this.booking) {
      this.error = 'Booking details are still loading.';
      return;
    }

    this.loading = true;
    this.message = '';
    this.error = '';

    this.loadRazorpayScript()
      .then(() => this.createOrder())
      .catch(() => {
        this.error = 'Could not load Razorpay checkout.';
        this.loading = false;
      });
  }

  private loadBooking(): void {
    this.api.getBooking(this.bookingId).subscribe({
      next: (booking) => {
        this.booking = booking;
      },
      error: () => {
        this.error = 'Could not load booking details.';
      }
    });
  }

  private createOrder(): void {
    if (!this.booking) return;

    const userId = this.auth.currentUser?.userId ?? 0;
    if (!userId) {
      this.error = 'Please login again before payment.';
      this.loading = false;
      return;
    }

    const payload = {
      bookingId: this.booking.bookingId,
      userId,
      amount: this.booking.totalFare,
      currency: 'INR',
      paymentMode: 'UPI'
    };

    this.api.createRazorpayOrder(payload).subscribe({
      next: (order) => this.openRazorpay(order),
      error: (err) => {
        const msg = String(err?.error?.message || err?.error || '');
        const shouldFallback = err?.status === 404 || msg.includes('No static resource payments/razorpay/order');

        if (shouldFallback) {
          this.api.createRazorpayOrderDirect(payload).subscribe({
            next: (order) => this.openRazorpay(order),
            error: (fallbackErr) => {
              this.error = this.describeError(fallbackErr);
              this.loading = false;
            }
          });
          return;
        }

        this.error = this.describeError(err);
        this.loading = false;
      }
    });
  }

  private openRazorpay(order: RazorpayOrderResponse): void {
    if (!order?.key || !order?.orderId || !order?.paymentId) {
      this.error = 'Razorpay order is missing key/orderId/paymentId.';
      this.loading = false;
      return;
    }

    const options = {
      key: order.key,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'SkyBooker',
      description: `Booking ${this.booking?.pnrCode || this.bookingId}`,
      order_id: order.orderId,
      prefill: {
        name: this.auth.currentUser?.fullName || '',
        email: this.auth.currentUser?.email || ''
      },
      handler: (response: any) => {
        const transactionId = response?.razorpay_payment_id;
        if (!transactionId) {
          this.error = 'Payment id not received from Razorpay.';
          this.loading = false;
          return;
        }
        this.completePayment(order.paymentId, transactionId);
      },
      modal: {
        ondismiss: () => {
          this.error = 'Payment window closed before completion.';
          this.loading = false;
        }
      },
      theme: { color: '#1769aa' }
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on('payment.failed', (response: any) => {
      this.error = response?.error?.description || 'Razorpay payment failed.';
      this.loading = false;
    });

    razorpay.open();
  }

  private completePayment(paymentId: string, transactionId: string): void {
    if (!this.booking) {
      this.error = 'Booking not found for payment confirmation.';
      this.loading = false;
      return;
    }

    // 1) mark payment in payment-service
    this.api.processPayment(paymentId, transactionId, 'PAID').subscribe({
      next: (payment) => {
        this.payment = payment;

        // 2) update booking status in booking-service
        this.api.updateBookingStatus(this.booking!.bookingId, 'CONFIRMED').subscribe({
          next: (updatedBooking) => {
            this.booking = updatedBooking;
            this.message = 'Payment done and booking confirmed.';
            this.sendConfirmationMail();
          },
          error: () => {
            this.error = 'Payment done, but booking status sync failed.';
            this.loading = false;
          }
        });
      },
      error: () => {
        this.error = 'Payment verification failed.';
        this.loading = false;
      }
    });
  }

  private sendConfirmationMail(): void {
    const userId = this.auth.currentUser?.userId ?? 0;
    const email = this.auth.currentUser?.email ?? '';

    if (!this.booking || !userId || !email) {
      this.message = 'Payment done. Could not send confirmation mail (missing user info).';
      this.loading = false;
      setTimeout(() => this.router.navigate(['/my-bookings']), 1200);
      return;
    }

    this.api.sendBookingConfirmation({
      userId,
      bookingId: this.booking.bookingId,
      email,
      phone: ''
    }).subscribe({
      next: () => {
        this.message = 'Payment done and confirmation mail sent.';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/my-bookings']), 1400);
      },
      error: () => {
        this.message = 'Payment done, but confirmation mail could not be sent.';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/my-bookings']), 1400);
      }
    });
  }

  private loadRazorpayScript(): Promise<void> {
    if (window.Razorpay) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });
  }

  private describeError(err: any): string {
    const backendMessage = err?.error?.message || err?.error?.error;
    if (backendMessage) return `Could not create Razorpay order: ${backendMessage}`;
    if (typeof err?.error === 'string' && err.error.trim()) return `Could not create Razorpay order: ${err.error}`;
    if (err?.status === 401 || err?.status === 403) return 'Please login again.';
    if (err?.status === 0) return 'Payment service not reachable.';
    return 'Razorpay order creation failed.';
  }
}
