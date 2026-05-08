import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingRequest, BookingResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly BASE_URL = 'http://localhost:8080/bookings';

  constructor(private http: HttpClient) {}

  bookFlight(request: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(this.BASE_URL, request);
  }
}
