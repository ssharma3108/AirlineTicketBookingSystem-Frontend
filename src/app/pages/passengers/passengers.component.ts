import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Passenger } from '../../models/models';
import { SkybookerApiService } from '../../services/skybooker-api.service';

@Component({
  standalone: true,
  selector: 'app-passengers',
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page">
      <div class="page-title">
        <h1>Passengers</h1>
        <p>Add passenger details for booking {{ bookingId }}.</p>
      </div>

      <div class="grid two section">
        <form class="card" (ngSubmit)="addPassenger()">
          <div class="grid two">
            <div><label>Title</label><select name="title" [(ngModel)]="form.title"><option>Mr</option><option>Ms</option><option>Mrs</option></select></div>
            <div><label>Gender</label><select name="gender" [(ngModel)]="form.gender"><option>MALE</option><option>FEMALE</option><option>OTHER</option></select></div>
            <div><label>First name</label><input name="firstName" [(ngModel)]="form.firstName" required></div>
            <div><label>Last name</label><input name="lastName" [(ngModel)]="form.lastName" required></div>
            <div><label>Date of birth</label><input name="dateOfBirth" [(ngModel)]="form.dateOfBirth" type="date" required></div>
            <div><label>Passenger type</label><select name="passengerType" [(ngModel)]="form.passengerType"><option>ADULT</option><option>CHILD</option><option>INFANT</option></select></div>
            <div><label>Passport number</label><input name="passportNumber" [(ngModel)]="form.passportNumber" required></div>
            <div><label>Passport expiry</label><input name="passportExpiry" [(ngModel)]="form.passportExpiry" type="date" required></div>
            <div><label>Nationality</label><input name="nationality" [(ngModel)]="form.nationality" required></div>
            <div><label>Seat number</label><input name="seatNumber" [(ngModel)]="form.seatNumber"></div>
          </div>
          <p *ngIf="message" class="alert success">{{ message }}</p>
          <p *ngIf="error" class="alert error">{{ error }}</p>
          <button class="btn primary" type="submit">Add passenger</button>
          <button class="btn ghost" type="button" (click)="goToPayment()">Continue to payment</button>
        </form>

        <article class="card">
          <h3>Saved passengers</h3>
          <table>
            <tbody>
              <tr *ngFor="let passenger of passengers">
                <td>{{ passenger.title }} {{ passenger.firstName }} {{ passenger.lastName }}</td>
                <td>{{ passenger.passportNumber }}</td>
              </tr>
              <tr *ngIf="passengers.length === 0"><td class="muted">No passengers added yet.</td><td></td></tr>
            </tbody>
          </table>
        </article>
      </div>
    </section>
  `
})
export class PassengersComponent implements OnInit {
  bookingId = '';
  passengers: Passenger[] = [];
  message = '';
  error = '';
  form: Passenger = this.emptyPassenger('');

  constructor(private route: ActivatedRoute, private router: Router, private api: SkybookerApiService) {}

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('bookingId') ?? '';
    this.form = this.emptyPassenger(this.bookingId);
    this.loadPassengers();
  }

  addPassenger(): void {
    this.message = '';
    this.error = '';
    this.api.addPassenger(this.form).subscribe({
      next: () => {
        this.message = 'Passenger added successfully.';
        this.form = this.emptyPassenger(this.bookingId);
        this.loadPassengers();
      },
      error: () => this.error = 'Could not add passenger. Check required fields and backend services.'
    });
  }

  goToPayment(): void {
    this.router.navigate(['/payment', this.bookingId]);
  }

  private loadPassengers(): void {
    this.api.getPassengers(this.bookingId).subscribe({
      next: (passengers) => this.passengers = passengers,
      error: () => this.passengers = []
    });
  }

  private emptyPassenger(bookingId: string): Passenger {
    return {
      bookingId,
      title: 'Mr',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'MALE',
      passportNumber: '',
      passportExpiry: '',
      nationality: '',
      seatNumber: '',
      passengerType: 'ADULT'
    };
  }
}
