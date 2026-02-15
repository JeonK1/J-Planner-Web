import type { ApiTravelPlan, ApiPlanSection, ApiFlightInfo, ApiAccommodationInfo } from './types'
import type { TravelPlan, PlanSection, FlightInfo, AccommodationInfo, SectionType, TripType } from '@/types'

export function mapApiPlanToDomain(api: ApiTravelPlan): TravelPlan {
  return {
    id: String(api.id),
    accessCode: api.accessCode,
    title: api.title,
    description: api.description ?? '',
    startDate: api.startDate ?? '',
    endDate: api.endDate ?? '',
    sections: api.sections.map(mapApiSectionToDomain),
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  }
}

export function mapApiSectionToDomain(api: ApiPlanSection): PlanSection {
  return {
    id: String(api.id),
    type: api.sectionType.toLowerCase() as SectionType,
    title: api.title,
    order: api.displayOrder,
    confirmed: api.confirmed,
    flightInfo: api.flightInfo ? mapApiFlightToDomain(api.flightInfo) : null,
    accommodationInfo: api.accommodationInfo ? mapApiAccommodationToDomain(api.accommodationInfo) : null,
  }
}

const API_TRIP_TYPE_MAP: Record<string, TripType> = {
  ONE_WAY: 'oneWay',
  ROUND_TRIP: 'roundTrip',
}

function mapApiFlightToDomain(api: ApiFlightInfo): FlightInfo {
  return {
    id: String(api.id),
    tripType: API_TRIP_TYPE_MAP[api.tripType] ?? 'oneWay',
    airline: api.airline,
    flightNumber: api.flightNumber,
    departureAirport: api.departureAirport,
    arrivalAirport: api.arrivalAirport,
    departureTime: api.departureTime,
    arrivalTime: api.arrivalTime,
    bookingReference: api.bookingReference ?? undefined,
    notes: api.notes ?? undefined,
    returnAirline: api.returnAirline ?? undefined,
    returnFlightNumber: api.returnFlightNumber ?? undefined,
    returnDepartureAirport: api.returnDepartureAirport ?? undefined,
    returnArrivalAirport: api.returnArrivalAirport ?? undefined,
    returnDepartureTime: api.returnDepartureTime ?? undefined,
    returnArrivalTime: api.returnArrivalTime ?? undefined,
    returnBookingReference: api.returnBookingReference ?? undefined,
    returnNotes: api.returnNotes ?? undefined,
    price: api.price ?? undefined,
  }
}

function mapApiAccommodationToDomain(api: ApiAccommodationInfo): AccommodationInfo {
  return {
    id: String(api.id),
    name: api.name,
    address: api.address,
    checkIn: api.checkIn,
    checkOut: api.checkOut,
    bookingReference: api.bookingReference ?? undefined,
    contactNumber: api.contactNumber ?? undefined,
    notes: api.notes ?? undefined,
    price: api.price ?? undefined,
  }
}

const DOMAIN_TRIP_TYPE_MAP: Record<string, string> = {
  oneWay: 'ONE_WAY',
  roundTrip: 'ROUND_TRIP',
}

export function mapDomainFlightToApi(flight: Partial<FlightInfo>) {
  return {
    tripType: DOMAIN_TRIP_TYPE_MAP[flight.tripType ?? 'oneWay'] ?? 'ONE_WAY',
    airline: flight.airline ?? '',
    flightNumber: flight.flightNumber ?? '',
    departureAirport: flight.departureAirport ?? '',
    arrivalAirport: flight.arrivalAirport ?? '',
    departureTime: flight.departureTime || null,
    arrivalTime: flight.arrivalTime || null,
    bookingReference: flight.bookingReference || null,
    notes: flight.notes || null,
    returnAirline: flight.returnAirline || null,
    returnFlightNumber: flight.returnFlightNumber || null,
    returnDepartureAirport: flight.returnDepartureAirport || null,
    returnArrivalAirport: flight.returnArrivalAirport || null,
    returnDepartureTime: flight.returnDepartureTime || null,
    returnArrivalTime: flight.returnArrivalTime || null,
    returnBookingReference: flight.returnBookingReference || null,
    returnNotes: flight.returnNotes || null,
    price: flight.price ?? null,
  }
}

export function mapDomainAccommodationToApi(acc: Partial<AccommodationInfo>) {
  return {
    name: acc.name ?? '',
    address: acc.address ?? '',
    checkIn: acc.checkIn || null,
    checkOut: acc.checkOut || null,
    bookingReference: acc.bookingReference || null,
    contactNumber: acc.contactNumber || null,
    notes: acc.notes || null,
    price: acc.price ?? null,
  }
}
