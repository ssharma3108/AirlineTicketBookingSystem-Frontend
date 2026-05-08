import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BookingRequest,
  BookingResponse,
  FareSummary,
  Flight,
  FlightRequest,
  AdminUserUpdate,
  AirlineRequest,
  AirportRequest,
  Passenger,
  PaymentRequest,
  PaymentResponse,
  BookingConfirmationRequest,
  RazorpayOrderResponse,
  Seat,
  UserProfile
} from '../models/models';

const API_URL = 'http://localhost:8080';

@Injectable({ providedIn: 'root' })
export class SkybookerApiService {
  constructor(private http: HttpClient) {}

  // ---------------- FLIGHTS ----------------
  searchFlights(origin: string, dest: string, date: string): Observable<Flight[]> {
    return this.http.get<Flight[]>(`${API_URL}/flights/search`, {
      params: { origin, dest, date }
    });
  }

  getFlight(id: number): Observable<Flight> {
    return this.http.get<Flight>(`${API_URL}/flights/${id}`);
  }

  getAllFlights(): Observable<Flight[]> {
    return this.http.get<Flight[]>(`${API_URL}/flights`);
  }

  createFlight(payload: FlightRequest): Observable<Flight> {
    return this.http.post<Flight>(`${API_URL}/flights`, payload);
  }

  createAirline(payload: AirlineRequest): Observable<AirlineRequest> {
    return this.http.post<AirlineRequest>(`${API_URL}/airlines`, payload);
  }

  getAllAirlines(): Observable<AirlineRequest[]> {
    return this.http.get<AirlineRequest[]>(`${API_URL}/airlines`);
  }

  createAirport(payload: AirportRequest): Observable<AirportRequest> {
    return this.http.post<AirportRequest>(`${API_URL}/airports`, payload);
  }

  getAllAirports(): Observable<AirportRequest[]> {
    return this.http.get<AirportRequest[]>(`${API_URL}/airports`);
  }

  updateFlight(id: number, payload: FlightRequest): Observable<Flight> {
    return this.http.put<Flight>(`${API_URL}/flights/${id}`, payload);
  }

  deleteFlight(id: number): Observable<string> {
    return this.http.delete(`${API_URL}/flights/${id}`, {
      responseType: 'text'
    });
  }

  // ---------------- BOOKINGS ----------------
  createBooking(payload: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${API_URL}/bookings`, payload);
  }

  getBooking(bookingId: string): Observable<BookingResponse> {
    return this.http.get<BookingResponse>(`${API_URL}/bookings/${bookingId}`);
  }

  getBookingByPnr(pnr: string): Observable<BookingResponse> {
    return this.http.get<BookingResponse>(`${API_URL}/bookings/pnr/${pnr}`);
  }

  getBookingsByUser(userId: number): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${API_URL}/bookings/user/${userId}`);
  }

  getBookingsByFlight(flightId: number): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${API_URL}/bookings/flight/${flightId}`);
  }

  getAllBookings(): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${API_URL}/bookings/all`);
  }

  cancelBooking(bookingId: string): Observable<BookingResponse> {
    return this.http.put<BookingResponse>(`${API_URL}/bookings/${bookingId}/cancel`, {});
  }

  requestRefund(bookingId: string): Observable<BookingResponse> {
    return this.http.put<BookingResponse>(`${API_URL}/bookings/${bookingId}/refund/request`, {});
  }
  requestRefundPost(bookingId: string): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${API_URL}/bookings/${bookingId}/refund/request`, {});
  }

  requestRefundDirect(bookingId: string): Observable<BookingResponse> {
    return this.http.put<BookingResponse>(`http://localhost:8084/bookings/${bookingId}/refund/request`, {});
  }
  requestRefundDirectPost(bookingId: string): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`http://localhost:8084/bookings/${bookingId}/refund/request`, {});
  }

  requestRefundDirectAlt(bookingId: string): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`http://localhost:8084/bookings/refund/request/${bookingId}`, {});
  }

  approveRefund(bookingId: string): Observable<BookingResponse> {
    return this.http.put<BookingResponse>(`${API_URL}/bookings/${bookingId}/refund/approve`, {});
  }

  approveRefundDirect(bookingId: string): Observable<BookingResponse> {
    return this.http.put<BookingResponse>(`http://localhost:8084/bookings/${bookingId}/refund/approve`, {});
  }

  rejectRefund(bookingId: string): Observable<BookingResponse> {
    return this.http.put<BookingResponse>(`${API_URL}/bookings/${bookingId}/refund/reject`, {});
  }

  rejectRefundDirect(bookingId: string): Observable<BookingResponse> {
    return this.http.put<BookingResponse>(`http://localhost:8084/bookings/${bookingId}/refund/reject`, {});
  }

  getRefundRequests(): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${API_URL}/bookings/refund/requests`);
  }

  getRefundRequestsDirect(): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>('http://localhost:8084/bookings/refund/requests');
  }

  updateBookingStatus(bookingId: string, status: string): Observable<BookingResponse> {
    return this.http.put<BookingResponse>(`${API_URL}/bookings/${bookingId}/status`, null, {
      params: { status }
    });
  }

  deleteBooking(bookingId: string): Observable<string> {
    return this.http.delete(`${API_URL}/bookings/${bookingId}`, {
      responseType: 'text'
    });
  }

 calculateFare(
    flightId: number,
    luggageKg: number,
    tripType = 'ONE_WAY',
    mealPreference = 'VEG',
    seatClass = 'NORMAL'
  ): Observable<FareSummary> {
    return this.http.get<FareSummary>(`${API_URL}/bookings/fare`, {
      params: { flightId, luggageKg, tripType, mealPreference, seatClass }
    });
  }

  // ---------------- USERS ----------------
  getAllUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${API_URL}/auth/users`);
  }

  updateUser(userId: number, payload: AdminUserUpdate): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${API_URL}/auth/users/${userId}`, payload);
  }

  deleteUser(userId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/auth/users/${userId}`);
  }

  // ---------------- SEATS ----------------
  getSeatsByFlight(flightId: number): Observable<Seat[]> {
    return this.http.get<Seat[]>(`${API_URL}/seats/flight/${flightId}`);
  }

  getAvailableSeats(flightId: number): Observable<Seat[]> {
    return this.http.get<Seat[]>(`${API_URL}/seats/available/${flightId}`);
  }

  // ---------------- PASSENGERS ----------------
  addPassenger(payload: Passenger): Observable<Passenger> {
    return this.http.post<Passenger>(`${API_URL}/passengers`, payload);
  }

  getPassengers(bookingId: string): Observable<Passenger[]> {
    return this.http.get<Passenger[]>(`${API_URL}/passengers/booking/${bookingId}`);
  }

  // ---------------- PAYMENTS ----------------
  initiatePayment(payload: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${API_URL}/payments/initiate`, payload);
  }

  createRazorpayOrder(payload: PaymentRequest): Observable<RazorpayOrderResponse> {
    return this.http.post<RazorpayOrderResponse>(`${API_URL}/payments/razorpay/order`, payload);
  }

  createRazorpayOrderDirect(payload: PaymentRequest): Observable<RazorpayOrderResponse> {
    return this.http.post<RazorpayOrderResponse>('http://localhost:8086/payments/razorpay/order', payload);
  }

 completeBookingPayment(paymentId: string, transactionId: string, status: string) {
  return this.http.post<BookingResponse>(`${API_URL}/bookings/payments/complete`, null, {
    params: { paymentId, transactionId, status }
  });

}


  processPayment(
    paymentId: string,
    transactionId: string,
    status: string
  ): Observable<PaymentResponse> {
    const params = new HttpParams()
      .set('paymentId', paymentId)
      .set('transactionId', transactionId)
      .set('status', status);

    return this.http.post<PaymentResponse>(`${API_URL}/payments/process`, null, { params });
  }

  getPaymentsByBooking(bookingId: string): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${API_URL}/payments/booking/${bookingId}`);
  }

  sendBookingConfirmation(payload: BookingConfirmationRequest): Observable<string> {
    return this.http.post(`${API_URL}/notifications/booking-confirmation`, payload, {
      responseType: 'text'
    });
  }
}
