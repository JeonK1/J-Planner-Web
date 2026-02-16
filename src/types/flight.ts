export type TripType = 'oneWay' | 'roundTrip';

export interface FlightLeg {
  id?: string;
  legOrder: number;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  bookingReference?: string;
  notes?: string;
}

export interface FlightInfo {
  id: string;
  tripType: TripType;
  legs: FlightLeg[];
  price?: number;
}

export interface FlightLegFormData {
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  bookingReference: string;
  notes: string;
}

export interface FlightFormData {
  tripType: TripType;
  legs: FlightLegFormData[];
  price?: number;
}
