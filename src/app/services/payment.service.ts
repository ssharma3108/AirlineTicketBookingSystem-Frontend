import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentRequest, PaymentResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly BASE_URL = 'http://localhost:8080/payments';

  constructor(private http: HttpClient) {}

  initiatePayment(request: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(this.BASE_URL, request);
  }

  getByBooking(bookingId: number): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.BASE_URL}/booking/${bookingId}`);
  }

  getByUser(email: string): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.BASE_URL}/user/${email}`);
  }

  refund(bookingId: number): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.BASE_URL}/refund/${bookingId}`, {});
  }

  getByStatus(status: string): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.BASE_URL}/status/${status}`);
  }
}
