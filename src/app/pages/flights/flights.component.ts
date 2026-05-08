import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Flight } from '../../models/models';
import { SkybookerApiService } from '../../services/skybooker-api.service';

@Component({
  standalone: true,
  selector: 'app-flights',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="page-title">
        <h1>Flights</h1>
        <p>Search available flights from the flight service.</p>
      </div>

      <form class="card toolbar section" (ngSubmit)="search()">
        <div><label>From</label><input name="origin" [(ngModel)]="origin" required></div>
        <div><label>To</label><input name="dest" [(ngModel)]="dest" required></div>
        <div><label>Date</label><input name="date" [(ngModel)]="date" type="date" required></div>
        <div><label>Status</label><input value="ON_TIME" disabled></div>
        <button class="btn primary" type="submit" [disabled]="loading">{{ loading ? 'Searching...' : 'Search' }}</button>
      </form>

      <p *ngIf="error" class="alert error">{{ error }}</p>

      <div class="card section table-wrap">
        <table>
          <thead>
            <tr>
              <th>Flight</th>
              <th>Route</th>
              <th>Departure</th>
              <th>Seats</th>
              <th>Fare</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let flight of flights">
              <td><strong>{{ flight.flightNumber }}</strong><br><span class="muted">{{ flight.aircraftType }}</span></td>
              <td>{{ flight.originAirportCode }} to {{ flight.destinationAirportCode }}</td>
              <td>{{ flight.departureTime | date:'medium' }}</td>
              <td>{{ flight.availableSeats }} / {{ flight.totalSeats }}</td>
              <td>{{ flight.basePrice | currency:'INR' }}</td>
              <td><a class="btn small primary" [routerLink]="['/booking', flight.id]">Book</a></td>
            </tr>
            <tr *ngIf="!loading && flights.length === 0">
              <td colspan="6" class="muted">No flights loaded yet. Search using airport codes like DEL and BOM.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class FlightsComponent implements OnInit {
  origin = 'DEL';
  dest = 'BOM';
  date = new Date().toISOString().slice(0, 10);
  flights: Flight[] = [];
  loading = false;
  error = '';

  constructor(private api: SkybookerApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.origin = params.get('origin') ?? this.origin;
      this.dest = params.get('dest') ?? this.dest;
      this.date = params.get('date') ?? this.date;
      if (params.has('origin')) {
        this.search();
      }
    });
  }

  search(): void {
    this.loading = true;
    this.error = '';
    this.api.searchFlights(this.origin, this.dest, this.date).subscribe({
      next: (flights) => {
        this.flights = flights;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load flights. Start the gateway and flight service, then try again.';
        this.loading = false;
      }
    });
  }
}
