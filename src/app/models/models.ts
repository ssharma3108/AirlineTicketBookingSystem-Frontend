export interface AuthResponse {
  token: string;
  role: string;
  userId: number;
  email?: string;
  fullName?: string;
}

export interface UserProfile {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  passportNumber: string;
  nationality: string;
}

export interface AdminUserUpdate {
  fullName: string;
  phone: string;
  passportNumber: string;
  nationality: string;
  role: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  passportNumber: string;
  nationality: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Flight {
  id: number;
  flightNumber: string;
  originAirportCode: string;
  destinationAirportCode: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  aircraftType: string;
  totalSeats: number;
  availableSeats: number;
  basePrice: number;
  status: string;
  airlineId: number;
}

export interface FlightRequest {
  flightNumber: string;
  originAirportCode: string;
  destinationAirportCode: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  aircraftType: string;
  totalSeats: number;
  availableSeats: number;
  basePrice: number;
  status: string;
  airlineId: number;
}

export interface AirlineRequest {
  name: string;
  iataCode: string;
  icaoCode: string;
  logoUrl: string;
  country: string;
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
}

export interface AirportRequest {
  name: string;
  iataCode: string;
  icaoCode: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface BookingRequest {
  userId: number;
  flightId: number;
  seatNumber: string;
  seatClass: string;
  tripType: string;
  mealPreference: string;
  luggageKg: number;
  contactEmail: string;
  contactPhone: string;
}

export interface BookingResponse {
  bookingId: string;
  pnrCode: string;
  status: string;
  refundStatus?: string;
  totalFare: number;
  seatNumber: string;
   userId?: number;
  flightId?: number;
}

export interface FareSummary {
  baseFare: number;
  taxes: number;
  totalFare: number;
}

export interface Passenger {
  passengerId?: number;
  bookingId: string;
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  passportNumber: string;
  passportExpiry: string;
  nationality: string;
  seatId?: number;
  seatNumber?: string;
  ticketNumber?: string;
  passengerType?: string;
}

export interface Seat {
  seatId: number;
  flightId: number;
  seatNumber: string;
  seatClass: string;
  rowNumber: number;
  columnLetter: string;
  status: string;
}

export interface PaymentRequest {
  bookingId: string;
  userId: number;
  amount: number;
  currency: string;
  paymentMode: string;
}

export interface PaymentResponse {
  paymentId: string;
  bookingId: string;
  userId: number;
  amount: number;
  currency: string;
  status: string;
  paymentMode: string;
  transactionId: string;
  paidAt: string;
}

export interface RazorpayOrderResponse {
  key: string;
  orderId: string;
  paymentId: string;
  bookingId: string;
  amount: number;
  currency: string;
}

export interface BookingConfirmationRequest {
  userId: number;
  bookingId: string;
  email: string;
  phone: string;
}
