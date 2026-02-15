import type { ApiTravelPlan, ApiPlanSection, ApiFlightInfo, ApiAccommodationInfo } from './types'
import type { TravelPlan, PlanSection, FlightInfo, AccommodationInfo, SectionType } from '@/types'

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
    flightInfo: api.flightInfo ? mapApiFlightToDomain(api.flightInfo) : null,
    accommodationInfo: api.accommodationInfo ? mapApiAccommodationToDomain(api.accommodationInfo) : null,
  }
}

function mapApiFlightToDomain(api: ApiFlightInfo): FlightInfo {
  return {
    id: String(api.id),
    airline: api.airline,
    flightNumber: api.flightNumber,
    departureAirport: api.departureAirport,
    arrivalAirport: api.arrivalAirport,
    departureTime: api.departureTime,
    arrivalTime: api.arrivalTime,
    bookingReference: api.bookingReference ?? undefined,
    notes: api.notes ?? undefined,
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
  }
}

export function mapDomainFlightToApi(flight: Partial<FlightInfo>) {
  return {
    airline: flight.airline ?? '',
    flightNumber: flight.flightNumber ?? '',
    departureAirport: flight.departureAirport ?? '',
    arrivalAirport: flight.arrivalAirport ?? '',
    departureTime: flight.departureTime || null,
    arrivalTime: flight.arrivalTime || null,
    bookingReference: flight.bookingReference || null,
    notes: flight.notes || null,
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
  }
}
