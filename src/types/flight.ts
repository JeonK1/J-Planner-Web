export type TripType = 'oneWay' | 'roundTrip';

export interface FlightInfo {
  id: string;
  tripType: TripType;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  bookingReference?: string;
  notes?: string;
  returnAirline?: string;
  returnFlightNumber?: string;
  returnDepartureAirport?: string;
  returnArrivalAirport?: string;
  returnDepartureTime?: string;
  returnArrivalTime?: string;
  returnBookingReference?: string;
  returnNotes?: string;
  price?: number;
}
