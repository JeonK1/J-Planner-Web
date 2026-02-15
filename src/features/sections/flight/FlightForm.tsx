import type { SectionFormProps } from '../types'
import type { FlightSectionData, FlightInfo } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { generateId } from '@/lib/utils'

export function FlightForm({ data, onChange }: SectionFormProps) {
  const flightData = data as FlightSectionData

  const updateFlight = (flightId: string, updates: Partial<FlightInfo>) => {
    onChange({
      ...flightData,
      flights: flightData.flights.map((f) =>
        f.id === flightId ? { ...f, ...updates } : f,
      ),
    })
  }

  const addFlight = () => {
    const newFlight: FlightInfo = {
      id: generateId(),
      airline: '',
      flightNumber: '',
      departureAirport: '',
      arrivalAirport: '',
      departureTime: '',
      arrivalTime: '',
    }
    onChange({
      ...flightData,
      flights: [...flightData.flights, newFlight],
    })
  }

  const removeFlight = (flightId: string) => {
    onChange({
      ...flightData,
      flights: flightData.flights.filter((f) => f.id !== flightId),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {flightData.flights.map((flight, index) => (
        <div
          key={flight.id}
          className="rounded-lg border border-gray-200 bg-gray-50 p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              항공편 {index + 1}
            </span>
            <Button
              type="button"
              variant="danger"
              className="px-2 py-1 text-xs"
              onClick={() => removeFlight(flight.id)}
            >
              삭제
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="항공사"
              value={flight.airline}
              onChange={(e) => updateFlight(flight.id, { airline: e.target.value })}
              placeholder="대한항공"
            />
            <Input
              label="편명"
              value={flight.flightNumber}
              onChange={(e) => updateFlight(flight.id, { flightNumber: e.target.value })}
              placeholder="KE001"
            />
            <Input
              label="출발 공항"
              value={flight.departureAirport}
              onChange={(e) => updateFlight(flight.id, { departureAirport: e.target.value })}
              placeholder="ICN"
            />
            <Input
              label="도착 공항"
              value={flight.arrivalAirport}
              onChange={(e) => updateFlight(flight.id, { arrivalAirport: e.target.value })}
              placeholder="NRT"
            />
            <Input
              label="출발 시간"
              type="datetime-local"
              value={flight.departureTime}
              onChange={(e) => updateFlight(flight.id, { departureTime: e.target.value })}
            />
            <Input
              label="도착 시간"
              type="datetime-local"
              value={flight.arrivalTime}
              onChange={(e) => updateFlight(flight.id, { arrivalTime: e.target.value })}
            />
            <Input
              label="예약번호"
              value={flight.bookingReference ?? ''}
              onChange={(e) => updateFlight(flight.id, { bookingReference: e.target.value })}
              placeholder="ABC123"
            />
            <Input
              label="메모"
              value={flight.notes ?? ''}
              onChange={(e) => updateFlight(flight.id, { notes: e.target.value })}
              placeholder="참고 사항"
            />
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={addFlight}
        className="self-start"
      >
        + 항공편 추가
      </Button>
    </div>
  )
}
