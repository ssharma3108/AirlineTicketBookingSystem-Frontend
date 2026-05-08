import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PassengerRequest, PassengerResponse, SeatAssignRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PassengerService {
  private readonly BASE_URL = 'http://localhost:8080/passengers';

  constructor(private http: HttpClient) {}

  addPassenger(request: PassengerRequest): Observable<PassengerResponse> {
    return this.http.post<PassengerResponse>(this.BASE_URL, request);
  }

  getById(passengerId: number): Observable<PassengerResponse> {
    return this.http.get<PassengerResponse>(`${this.BASE_URL}/${passengerId}`);
  }

  getByBooking(bookingId: string): Observable<PassengerResponse[]> {
    return this.http.get<PassengerResponse[]>(`${this.BASE_URL}/booking/${bookingId}`);
  }

  getByPassport(passportNumber: string): Observable<PassengerResponse> {
    return this.http.get<PassengerResponse>(`${this.BASE_URL}/passport/${passportNumber}`);
  }

  getByTicket(ticketNumber: string): Observable<PassengerResponse> {
    return this.http.get<PassengerResponse>(`${this.BASE_URL}/ticket/${ticketNumber}`);
  }

  updatePassenger(passengerId: number, request: PassengerRequest): Observable<PassengerResponse> {
    return this.http.put<PassengerResponse>(`${this.BASE_URL}/${passengerId}`, request);
  }

  assignSeat(request: SeatAssignRequest): Observable<PassengerResponse> {
    return this.http.put<PassengerResponse>(`${this.BASE_URL}/assign-seat`, request);
  }

  deletePassenger(passengerId: number): Observable<string> {
    return this.http.delete<string>(`${this.BASE_URL}/${passengerId}`);
  }

  deleteByBooking(bookingId: string): Observable<string> {
    return this.http.delete<string>(`${this.BASE_URL}/booking/${bookingId}`);
  }

  getCount(bookingId: string): Observable<number> {
    return this.http.get<number>(`${this.BASE_URL}/count/${bookingId}`);
  }
}
