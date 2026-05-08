import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FlightRequest, FlightResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class FlightService {
  private readonly BASE_URL = 'http://localhost:8080/flights';

  constructor(private http: HttpClient) {}

  addFlight(request: FlightRequest): Observable<FlightResponse> {
    return this.http.post<FlightResponse>(this.BASE_URL, request);
  }

  getAllFlights(): Observable<FlightResponse[]> {
    return this.http.get<FlightResponse[]>(this.BASE_URL);
  }

  searchFlights(source: string, destination: string, date: string): Observable<FlightResponse[]> {
    return this.http.get<FlightResponse[]>(`${this.BASE_URL}/search`, {
      params: { source, destination, date }
    });
  }

  reduceSeats(id: number, seats: number): Observable<string> {
    return this.http.put<string>(`${this.BASE_URL}/${id}/reduce-seats`, null, {
      params: { seats: seats.toString() }
    });
  }
}
