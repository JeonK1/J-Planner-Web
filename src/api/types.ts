export interface ApiTravelPlan {
  id: number;
  accessCode: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  sections: ApiPlanSection[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiPlanSection {
  id: number;
  title: string;
  sectionType: 'FLIGHT' | 'ACCOMMODATION';
  displayOrder: number;
  confirmed: boolean;
  flightInfo: ApiFlightInfo | null;
  accommodationInfo: ApiAccommodationInfo | null;
}

export interface ApiFlightInfo {
  id: number;
  tripType: 'ONE_WAY' | 'ROUND_TRIP';
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  bookingReference: string | null;
  notes: string | null;
  returnAirline: string | null;
  returnFlightNumber: string | null;
  returnDepartureAirport: string | null;
  returnArrivalAirport: string | null;
  returnDepartureTime: string | null;
  returnArrivalTime: string | null;
  returnBookingReference: string | null;
  returnNotes: string | null;
  price: number | null;
}

export interface ApiAccommodationInfo {
  id: number;
  name: string;
  address: string;
  checkIn: string;
  checkOut: string;
  bookingReference: string | null;
  contactNumber: string | null;
  notes: string | null;
  price: number | null;
}
