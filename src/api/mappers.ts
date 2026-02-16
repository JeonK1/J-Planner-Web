import type { ApiTravelPlan, ApiPlanSection, ApiFlightInfo, ApiAccommodationInfo } from './types'
import type { TravelPlan, PlanSection, FlightInfo, AccommodationInfo, SectionType, TripType, FlightFormData } from '@/types'

export function mapApiPlanToDomain(api: ApiTravelPlan): TravelPlan {
  return {
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
  const tripType = API_TRIP_TYPE_MAP[api.tripType] ?? 'oneWay'
  return {
    id: String(api.id),
    tripType,
    legs: api.legs.map((leg) => ({
      id: String(leg.id),
      legOrder: leg.legOrder,
      airline: leg.airline,
      flightNumber: leg.flightNumber,
      departureAirport: leg.departureAirport,
      arrivalAirport: leg.arrivalAirport,
      departureTime: leg.departureTime,
      arrivalTime: leg.arrivalTime,
      bookingReference: leg.bookingReference ?? undefined,
      notes: leg.notes ?? undefined,
    })),
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

export function mapDomainFlightToApi(flight: Partial<FlightFormData>) {
  const legs = (flight.legs ?? []).map((leg, index) => ({
    legOrder: index,
    airline: leg.airline ?? '',
    flightNumber: leg.flightNumber ?? '',
    departureAirport: leg.departureAirport ?? '',
    arrivalAirport: leg.arrivalAirport ?? '',
    departureTime: leg.departureTime || null,
    arrivalTime: leg.arrivalTime || null,
    bookingReference: leg.bookingReference || null,
    notes: leg.notes || null,
  }))

  return {
    tripType: DOMAIN_TRIP_TYPE_MAP[flight.tripType ?? 'oneWay'] ?? 'ONE_WAY',
    legs,
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
