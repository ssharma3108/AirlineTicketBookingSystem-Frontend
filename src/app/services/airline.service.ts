import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AirlineRequest, AirlineResponse, AirportRequest, AirportResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AirlineService {
  private readonly AIRLINE_URL = 'http://localhost:8080/airlines';
  private readonly AIRPORT_URL = 'http://localhost:8080/airports';

  constructor(private http: HttpClient) {}

  // Airlines
  addAirline(request: AirlineRequest): Observable<AirlineResponse> {
    return this.http.post<AirlineResponse>(this.AIRLINE_URL, request);
  }

  getAirlineById(id: number): Observable<AirlineResponse> {
    return this.http.get<AirlineResponse>(`${this.AIRLINE_URL}/${id}`);
  }

  getAirlineByIata(iataCode: string): Observable<AirlineResponse> {
    return this.http.get<AirlineResponse>(`${this.AIRLINE_URL}/iata/${iataCode}`);
  }

  getAllAirlines(): Observable<AirlineResponse[]> {
    return this.http.get<AirlineResponse[]>(this.AIRLINE_URL);
  }

  getActiveAirlines(): Observable<AirlineResponse[]> {
    return this.http.get<AirlineResponse[]>(`${this.AIRLINE_URL}/active`);
  }

  updateAirline(id: number, request: AirlineRequest): Observable<AirlineResponse> {
    return this.http.put<AirlineResponse>(`${this.AIRLINE_URL}/${id}`, request);
  }

  toggleAirlineStatus(id: number): Observable<AirlineResponse> {
    return this.http.put<AirlineResponse>(`${this.AIRLINE_URL}/${id}/toggle-status`, {});
  }

  // Airports
  addAirport(request: AirportRequest): Observable<AirportResponse> {
    return this.http.post<AirportResponse>(this.AIRPORT_URL, request);
  }

  getAirportById(id: number): Observable<AirportResponse> {
    return this.http.get<AirportResponse>(`${this.AIRPORT_URL}/${id}`);
  }

  getAirportByIata(iataCode: string): Observable<AirportResponse> {
    return this.http.get<AirportResponse>(`${this.AIRPORT_URL}/iata/${iataCode}`);
  }

  getAllAirports(): Observable<AirportResponse[]> {
    return this.http.get<AirportResponse[]>(this.AIRPORT_URL);
  }

  searchAirports(keyword: string): Observable<AirportResponse[]> {
    return this.http.get<AirportResponse[]>(`${this.AIRPORT_URL}/search`, {
      params: { keyword }
    });
  }

  updateAirport(id: number, request: AirportRequest): Observable<AirportResponse> {
    return this.http.put<AirportResponse>(`${this.AIRPORT_URL}/${id}`, request);
  }
}
