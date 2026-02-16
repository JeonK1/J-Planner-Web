export interface ApiTravelPlan {
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

export interface ApiFlightLeg {
  id: number;
  legOrder: number;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  bookingReference: string | null;
  notes: string | null;
}

export interface ApiFlightInfo {
  id: number;
  tripType: 'ONE_WAY' | 'ROUND_TRIP';
  legs: ApiFlightLeg[];
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
