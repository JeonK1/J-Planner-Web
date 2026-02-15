import type { SectionDisplayProps } from '../types'
import { formatDateTime } from '@/lib/utils'

export function FlightDisplay({ section }: SectionDisplayProps) {
  const flight = section.flightInfo

  if (!flight) {
    return <p className="text-sm text-gray-500">비행기 정보가 없습니다.</p>
  }

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-semibold text-blue-600">
          {flight.airline}
        </span>
        <span className="text-sm text-gray-500">{flight.flightNumber}</span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{flight.departureAirport}</span>
          {flight.departureTime && (
            <span className="text-xs text-gray-500">{formatDateTime(flight.departureTime)}</span>
          )}
        </div>
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{flight.arrivalAirport}</span>
          {flight.arrivalTime && (
            <span className="text-xs text-gray-500">{formatDateTime(flight.arrivalTime)}</span>
          )}
        </div>
      </div>
      {(flight.bookingReference || flight.notes) && (
        <div className="mt-2 flex flex-col gap-1 border-t border-gray-200 pt-2 text-xs text-gray-500">
          {flight.bookingReference && (
            <span>예약번호: {flight.bookingReference}</span>
          )}
          {flight.notes && <span>{flight.notes}</span>}
        </div>
      )}
    </div>
  )
}
