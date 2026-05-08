import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Flight } from '../../models/models';
import { SkybookerApiService } from '../../services/skybooker-api.service';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  template: `
    <section class="hero-slider">
      <div class="slides">
        <article
          *ngFor="let slide of slides; let i = index"
          class="slide"
          [class.active]="i === currentSlide"
          [style.background-image]="'linear-gradient(120deg, rgba(10, 26, 53, 0.65), rgba(16, 124, 138, 0.45)), url(' + slide.image + ')'"
        >
          <div class="slide-content">
            <span class="hero-chip">Experience the Journey</span>
            <h1>{{ slide.title }}</h1>
            <p>{{ slide.subtitle }}</p>

            <form class="hero-search" (ngSubmit)="search()">
              <div class="hero-field">
                <label>Location</label>
                <input name="origin" [(ngModel)]="origin" placeholder="DEL" required>
              </div>
              <div class="hero-field">
                <label>Destination</label>
                <input name="dest" [(ngModel)]="dest" placeholder="BOM" required>
              </div>
              <div class="hero-field">
                <label>Date</label>
                <input name="date" [(ngModel)]="date" type="date" required>
              </div>
              <div class="hero-field">
                <label>Trip</label>
                <select name="tripType" [(ngModel)]="tripType">
                  <option value="ONE_WAY">One way</option>
                  <option value="ROUND_TRIP">Round trip</option>
                </select>
              </div>
              <button class="btn primary hero-search-btn" type="submit">Search</button>
            </form>

            <div class="hero-stats">
              <div>
                <strong>10,000+</strong>
                <span>Happy Travelers</span>
              </div>
              <div>
                <strong>150+</strong>
                <span>Destinations</span>
              </div>
              <div>
                <strong>50+</strong>
                <span>Countries</span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div class="slide-dots">
        <button
          *ngFor="let _ of slides; let i = index"
          type="button"
          [class.active]="i === currentSlide"
          (click)="goToSlide(i)"
          aria-label="Go to slide"
        ></button>
      </div>
    </section>

    <section class="page">
      <div class="grid three section">
        <article class="card feature-card">
          <div class="feature-top">
            <span class="feature-icon">🔎</span>
            <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=320&q=80" alt="Flight search">
          </div>
          <h3>Fast search</h3>
          <p class="muted">Connects to <strong>/flights/search</strong> through the API gateway.</p>
        </article>
        <article class="card feature-card">
          <div class="feature-top">
            <span class="feature-icon">💺</span>
            <img src="https://images.unsplash.com/photo-1556388158-158ea5ccacbd?auto=format&fit=crop&w=320&q=80" alt="Seat booking">
          </div>
          <h3>Seat aware booking</h3>
          <p class="muted">Loads available seats from the seat service before creating a booking.</p>
        </article>
        <article class="card feature-card">
          <div class="feature-top">
            <span class="feature-icon">💳</span>
            <img src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=320&q=80" alt="Payment flow">
          </div>
          <h3>Payment ready</h3>
          <p class="muted">Initiates and processes payments using the payment service endpoints.</p>
        </article>
      </div>

      <section class="section">
        <div class="section-head">
          <h2>Available flights</h2>
          <p class="muted">Live rows and columns from your flight service.</p>
        </div>

        <div class="flights-gallery">
          <article class="flight-card" *ngFor="let flight of availableFlights; let i = index">
            <img [src]="flightImage(i)" [alt]="flight.flightNumber">
            <div class="flight-content">
              <h3>{{ flight.flightNumber }}</h3>
              <p class="muted">{{ flight.originAirportCode }} to {{ flight.destinationAirportCode }}</p>
              <p><strong>{{ flight.basePrice | currency:'INR' }}</strong></p>
              <div class="flight-meta">
                <span>{{ flight.departureTime | date:'mediumDate' }}</span>
                <span>{{ flight.status }}</span>
                <span>{{ flight.availableSeats }}/{{ flight.totalSeats }} seats</span>
              </div>
              <button class="btn small primary" type="button" (click)="bookFlight(flight.id)">Book</button>
            </div>
          </article>
        </div>
      </section>
    </section>

    <footer class="travel-footer">
      <div class="footer-overlay">
        <div class="footer-top">
          <p class="mini">Keep in touch</p>
          <h3>Travel with Us</h3>
          <div class="newsletter">
            <input type="email" placeholder="Enter your email">
            <button type="button">Send</button>
          </div>
        </div>

        <div class="footer-main">
          <div>
            <h4>SkyBooker</h4>
            <p>Search flights, compare routes, reserve seats, and manage your trip in one place.</p>
          </div>
          <div>
            <h5>Our Agency</h5>
            <a href="#">Services</a>
            <a href="#">Insurance</a>
            <a href="#">Tourism</a>
            <a href="#">Payment</a>
          </div>
          <div>
            <h5>Partners</h5>
            <a href="#">Booking</a>
            <a href="#">Trivago</a>
            <a href="#">TripAdvisor</a>
            <a href="#">Hostelworld</a>
          </div>
          <div>
            <h5>Last Minute</h5>
            <a href="#">London</a>
            <a href="#">California</a>
            <a href="#">Indonesia</a>
            <a href="#">Tokyo</a>
          </div>
        </div>

        <div class="footer-bottom">
          <span>The best modern travel theme</span>
          <span>SkyBooker travel platform</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .hero-slider {
      position: relative;
      min-height: 620px;
      overflow: hidden;
      border-bottom: 1px solid #dbe4f2;
    }

    .slides {
      position: relative;
      height: 100%;
      min-height: 620px;
    }

    .slide {
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 0.9s ease, transform 0.9s ease;
      background-size: cover;
      background-position: center;
      transform: scale(1.02);
      display: flex;
      align-items: center;
    }

    .slide.active {
      opacity: 1;
      transform: scale(1);
    }

    .slide-content {
      color: #ffffff;
      max-width: 1180px;
      margin: 0 auto;
      width: 100%;
      padding: 0 24px;
      animation: slideIn 0.7s ease;
      display: grid;
      gap: 14px;
    }

    .hero-chip {
      width: fit-content;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.28);
      border-radius: 999px;
      padding: 7px 13px;
      font-size: 12px;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      font-weight: 700;
    }

    .slide-content h1 {
      font-size: 66px;
      line-height: 1.08;
      margin: 0;
      text-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
      max-width: 720px;
    }

    .slide-content p {
      margin: 0;
      font-size: 28px;
      color: rgba(255, 255, 255, 0.92);
      text-shadow: 0 8px 22px rgba(0, 0, 0, 0.3);
      max-width: 720px;
    }

    .hero-search {
      margin-top: 10px;
      width: min(980px, 100%);
      background: #ffffff;
      border-radius: 999px;
      padding: 10px;
      display: grid;
      grid-template-columns: 1.1fr 1.1fr 1fr 1fr auto;
      gap: 8px;
      box-shadow: 0 20px 46px rgba(7, 38, 82, 0.25);
      border: 1px solid #d6e3f3;
    }

    .hero-field {
      padding: 6px 10px;
      border-right: 1px solid #edf2fa;
    }

    .hero-field:last-of-type {
      border-right: 0;
    }

    .hero-field label {
      margin: 0 0 4px;
      font-size: 11px;
      color: #5d6f89;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .hero-field input,
    .hero-field select {
      border: 0;
      padding: 0;
      min-height: 24px;
      color: #102747;
      background: transparent;
      outline: none;
      box-shadow: none;
    }

    .hero-search-btn {
      border-radius: 999px;
      min-width: 140px;
      min-height: 56px;
      align-self: center;
    }

    .hero-stats {
      margin-top: 8px;
      display: flex;
      gap: 22px;
      flex-wrap: wrap;
    }

    .hero-stats div {
      min-width: 132px;
      border-left: 1px solid rgba(255, 255, 255, 0.3);
      padding-left: 14px;
    }

    .hero-stats strong {
      display: block;
      font-size: 28px;
      line-height: 1.1;
    }

    .hero-stats span {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.85);
    }

    .slide-dots {
      position: absolute;
      left: 50%;
      bottom: 18px;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
    }

    .slide-dots button {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 0;
      background: rgba(255, 255, 255, 0.45);
      cursor: pointer;
      transition: transform 0.2s ease, background-color 0.2s ease;
    }

    .slide-dots button.active {
      background: #ffffff;
      transform: scale(1.25);
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .feature-card {
      border: 1px solid #c9d9ec;
      background:
        linear-gradient(#ffffff, #ffffff) padding-box,
        linear-gradient(135deg, #a8c9ea, #87d3cf) border-box;
      box-shadow: 0 8px 22px rgba(17, 56, 98, 0.08);
      transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
      position: relative;
      overflow: hidden;
    }

    .feature-card::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 3px;
      background: linear-gradient(90deg, #0f67ab, #1f9e95);
      transform: scaleX(0.28);
      transform-origin: left;
      transition: transform 0.28s ease;
    }

    .feature-card:hover {
      transform: translateY(-6px);
      border-color: #7ab1df;
      box-shadow: 0 18px 34px rgba(16, 76, 124, 0.16);
    }

    .feature-card:hover::after {
      transform: scaleX(1);
    }

    .feature-card h3 {
      margin-top: 12px;
      transition: color 0.25s ease;
    }

    .feature-card:hover h3 {
      color: #0f5f9f;
    }

    .feature-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .feature-icon {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      background: #eaf3fe;
      border: 1px solid #c9dcf5;
      flex-shrink: 0;
    }

    .feature-top img {
      width: 106px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid #d4e1f2;
      box-shadow: 0 6px 14px rgba(20, 58, 98, 0.16);
      transition: transform 0.25s ease;
    }

    .feature-card:hover .feature-top img {
      transform: scale(1.05);
    }

    .section-head h2 {
      margin: 0 0 6px;
      font-size: 30px;
    }

    .flights-gallery {
      margin-top: 14px;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
    }

    .flight-card {
      border: 1px solid #d5e0ef;
      border-radius: 8px;
      overflow: hidden;
      background: #ffffff;
      box-shadow: 0 10px 22px rgba(18, 45, 83, 0.08);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }

    .flight-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 18px 28px rgba(18, 45, 83, 0.14);
    }

    .flight-card img {
      width: 100%;
      height: 150px;
      object-fit: cover;
      display: block;
    }

    .flight-content {
      padding: 14px;
    }

    .flight-content h3 {
      margin: 0 0 6px;
      font-size: 18px;
    }

    .flight-meta {
      display: grid;
      gap: 4px;
      color: #5f718d;
      font-size: 13px;
      margin: 10px 0 12px;
    }

    .travel-footer {
      margin-top: 30px;
      background-image:
        linear-gradient(130deg, rgba(13, 41, 75, 0.86), rgba(24, 116, 132, 0.86)),
        url('https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1800&q=80');
      background-size: cover;
      background-position: center;
      color: #f3f7ff;
    }

    .footer-overlay {
      max-width: 1180px;
      margin: 0 auto;
      padding: 34px 24px 18px;
    }

    .footer-top .mini {
      text-transform: uppercase;
      letter-spacing: 1.2px;
      opacity: 0.8;
      margin: 0;
      font-size: 11px;
    }

    .footer-top h3 {
      margin: 2px 0 12px;
      font-size: 34px;
    }

    .newsletter {
      display: flex;
      gap: 8px;
      max-width: 460px;
    }

    .newsletter input {
      border: 0;
      background: rgba(255, 255, 255, 0.92);
    }

    .newsletter button {
      border: 0;
      border-radius: 8px;
      min-width: 84px;
      font-weight: 700;
      cursor: pointer;
      background: #14b8d4;
      color: #ffffff;
    }

    .footer-main {
      margin-top: 20px;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding: 18px 0;
    }

    .footer-main h4, .footer-main h5 {
      margin: 0 0 8px;
    }

    .footer-main p {
      margin: 0;
      color: rgba(243, 247, 255, 0.85);
      max-width: 520px;
    }

    .footer-main a {
      display: block;
      opacity: 0.9;
      margin: 4px 0;
    }

    .footer-bottom {
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      opacity: 0.92;
    }

    @media (max-width: 760px) {
      .hero-slider,
      .slides {
        min-height: 540px;
      }

      .slide-content h1 {
        font-size: 42px;
      }

      .slide-content p {
        font-size: 20px;
      }

      .hero-search {
        border-radius: 16px;
        grid-template-columns: 1fr;
      }

      .hero-field {
        border-right: 0;
        border-bottom: 1px solid #edf2fa;
      }

      .hero-field:last-of-type {
        border-bottom: 0;
      }

      .hero-search-btn {
        width: 100%;
      }

      .flights-gallery {
        grid-template-columns: 1fr;
      }

      .newsletter {
        flex-direction: column;
      }

      .footer-main {
        grid-template-columns: 1fr 1fr;
      }

      .footer-bottom {
        flex-direction: column;
        gap: 6px;
      }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  origin = 'DEL';
  dest = 'BOM';
  date = new Date().toISOString().slice(0, 10);
  tripType = 'ONE_WAY';
  currentSlide = 0;
  availableFlights: Flight[] = [];

  slides = [
    {
      title: 'SkyBooker',
      subtitle: 'Book your next flight with speed and confidence.',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=80'
    },
    {
      title: 'Smooth Multi-City Experience',
      subtitle: 'Find routes, compare options, and reserve your seat quickly.',
      image: 'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?auto=format&fit=crop&w=1800&q=80'
    },
    {
      title: 'Designed For Reliable Travel',
      subtitle: 'Secure booking, passenger details, and payment flow in one place.',
      image: 'https://images.unsplash.com/photo-1521727857535-28d2047314ac?auto=format&fit=crop&w=1800&q=80'
    }
  ];

  private sliderTimer?: ReturnType<typeof setInterval>;

  constructor(private router: Router, private api: SkybookerApiService) {}

  ngOnInit(): void {
    this.api.getAllFlights().subscribe({
      next: (flights) => this.availableFlights = flights,
      error: () => this.availableFlights = []
    });

    this.sliderTimer = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    }, 3600);
  }

  ngOnDestroy(): void {
    if (this.sliderTimer) {
      clearInterval(this.sliderTimer);
    }
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  flightImage(index: number): string {
    const images = [
      'https://images.unsplash.com/photo-1474302770737-173ee21bab63?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540339832862-474599807836?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1521727857535-28d2047314ac?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=1200&q=80'
    ];
    return images[index % images.length];
  }

  bookFlight(flightId: number): void {
    this.router.navigate(['/booking', flightId]);
  }

  search(): void {
    this.router.navigate(['/flights'], {
      queryParams: {
        origin: this.origin,
        dest: this.dest,
        date: this.date,
        tripType: this.tripType
      }
    });
  }
}
