import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SeatRequest, SeatResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SeatService {
  private readonly BASE_URL = 'http://localhost:8080/seats';

  constructor(private http: HttpClient) {}

  addSeat(request: SeatRequest): Observable<SeatResponse> {
    return this.http.post<SeatResponse>(this.BASE_URL, request);
  }

  getAllByFlight(flightId: number): Observable<SeatResponse[]> {
    return this.http.get<SeatResponse[]>(`${this.BASE_URL}/flight/${flightId}`);
  }

  getAvailable(flightId: number): Observable<SeatResponse[]> {
    return this.http.get<SeatResponse[]>(`${this.BASE_URL}/flight/${flightId}/available`);
  }

  getByClass(flightId: number, seatClass: string): Observable<SeatResponse[]> {
    return this.http.get<SeatResponse[]>(`${this.BASE_URL}/flight/${flightId}/class/${seatClass}`);
  }

  holdSeat(flightId: number, seatNumber: string): Observable<SeatResponse> {
    return this.http.put<SeatResponse>(`${this.BASE_URL}/flight/${flightId}/hold/${seatNumber}`, {});
  }

  confirmSeat(flightId: number, seatNumber: string): Observable<SeatResponse> {
    return this.http.put<SeatResponse>(`${this.BASE_URL}/flight/${flightId}/confirm/${seatNumber}`, {});
  }

  releaseSeat(flightId: number, seatNumber: string): Observable<SeatResponse> {
    return this.http.put<SeatResponse>(`${this.BASE_URL}/flight/${flightId}/release/${seatNumber}`, {});
  }

  getAvailableCount(flightId: number): Observable<number> {
    return this.http.get<number>(`${this.BASE_URL}/flight/${flightId}/count`);
  }
}
