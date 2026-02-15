import { useState } from 'react'
import type { SectionFormProps } from '../types'
import type { FlightInfo, TripType } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ImageGallery } from '@/components/ui/ImageGallery'

type FlightFields = Omit<FlightInfo, 'id'>

export function FlightForm({ section, onSave }: SectionFormProps) {
  const initial = section.flightInfo
  const [title, setTitle] = useState(section.title)
  const [flight, setFlight] = useState<FlightFields>({
    tripType: initial?.tripType ?? 'oneWay',
    airline: initial?.airline ?? '',
    flightNumber: initial?.flightNumber ?? '',
    departureAirport: initial?.departureAirport ?? '',
    arrivalAirport: initial?.arrivalAirport ?? '',
    departureTime: initial?.departureTime ?? '',
    arrivalTime: initial?.arrivalTime ?? '',
    bookingReference: initial?.bookingReference ?? '',
    notes: initial?.notes ?? '',
    returnAirline: initial?.returnAirline ?? '',
    returnFlightNumber: initial?.returnFlightNumber ?? '',
    returnDepartureAirport: initial?.returnDepartureAirport ?? '',
    returnArrivalAirport: initial?.returnArrivalAirport ?? '',
    returnDepartureTime: initial?.returnDepartureTime ?? '',
    returnArrivalTime: initial?.returnArrivalTime ?? '',
    returnBookingReference: initial?.returnBookingReference ?? '',
    returnNotes: initial?.returnNotes ?? '',
    price: initial?.price,
  })
  const [isSaving, setIsSaving] = useState(false)

  const isRoundTrip = flight.tripType === 'roundTrip'

  const update = (updates: Partial<FlightFields>) => {
    setFlight((prev) => ({ ...prev, ...updates }))
  }

  const handleTripTypeChange = (tripType: TripType) => {
    if (tripType === 'oneWay') {
      update({
        tripType,
        returnAirline: '',
        returnFlightNumber: '',
        returnDepartureAirport: '',
        returnArrivalAirport: '',
        returnDepartureTime: '',
        returnArrivalTime: '',
        returnBookingReference: '',
        returnNotes: '',
      })
    } else {
      update({ tripType })
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    await onSave({ title, flightInfo: flight })
    setIsSaving(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="섹션 제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="인천 ↔ 나리타"
      />

      <div className="flex gap-2">
        <button
          type="button"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !isRoundTrip
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => handleTripTypeChange('oneWay')}
        >
          편도
        </button>
        <button
          type="button"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            isRoundTrip
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => handleTripTypeChange('roundTrip')}
        >
          왕복
        </button>
      </div>

      {isRoundTrip && (
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          출국
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="항공사"
          value={flight.airline}
          onChange={(e) => update({ airline: e.target.value })}
          placeholder="대한항공"
        />
        <Input
          label="편명"
          value={flight.flightNumber}
          onChange={(e) => update({ flightNumber: e.target.value })}
          placeholder="KE001"
        />
        <Input
          label="출발 공항"
          value={flight.departureAirport}
          onChange={(e) => update({ departureAirport: e.target.value })}
          placeholder="ICN"
        />
        <Input
          label="도착 공항"
          value={flight.arrivalAirport}
          onChange={(e) => update({ arrivalAirport: e.target.value })}
          placeholder="NRT"
        />
        <Input
          label="출발 시간"
          type="datetime-local"
          value={flight.departureTime}
          onChange={(e) => update({ departureTime: e.target.value })}
        />
        <Input
          label="도착 시간"
          type="datetime-local"
          value={flight.arrivalTime}
          onChange={(e) => update({ arrivalTime: e.target.value })}
        />
        <Input
          label="예약번호"
          value={flight.bookingReference ?? ''}
          onChange={(e) => update({ bookingReference: e.target.value })}
          placeholder="ABC123"
        />
        <Input
          label="메모"
          value={flight.notes ?? ''}
          onChange={(e) => update({ notes: e.target.value })}
          placeholder="참고 사항"
        />
      </div>

      {isRoundTrip && (
        <>
          <div className="border-t border-gray-200 pt-4">
            <div className="mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              입국
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="항공사"
                value={flight.returnAirline ?? ''}
                onChange={(e) => update({ returnAirline: e.target.value })}
                placeholder="대한항공"
              />
              <Input
                label="편명"
                value={flight.returnFlightNumber ?? ''}
                onChange={(e) => update({ returnFlightNumber: e.target.value })}
                placeholder="KE002"
              />
              <Input
                label="출발 공항"
                value={flight.returnDepartureAirport ?? ''}
                onChange={(e) => update({ returnDepartureAirport: e.target.value })}
                placeholder="NRT"
              />
              <Input
                label="도착 공항"
                value={flight.returnArrivalAirport ?? ''}
                onChange={(e) => update({ returnArrivalAirport: e.target.value })}
                placeholder="ICN"
              />
              <Input
                label="출발 시간"
                type="datetime-local"
                value={flight.returnDepartureTime ?? ''}
                onChange={(e) => update({ returnDepartureTime: e.target.value })}
              />
              <Input
                label="도착 시간"
                type="datetime-local"
                value={flight.returnArrivalTime ?? ''}
                onChange={(e) => update({ returnArrivalTime: e.target.value })}
              />
              <Input
                label="예약번호"
                value={flight.returnBookingReference ?? ''}
                onChange={(e) => update({ returnBookingReference: e.target.value })}
                placeholder="ABC123"
              />
              <Input
                label="메모"
                value={flight.returnNotes ?? ''}
                onChange={(e) => update({ returnNotes: e.target.value })}
                placeholder="참고 사항"
              />
            </div>
          </div>
        </>
      )}

      <div className="flex items-center gap-2">
        <Input
          label="가격"
          type="number"
          value={flight.price ?? ''}
          onChange={(e) => update({ price: e.target.value === '' ? undefined : Number(e.target.value) })}
          placeholder="350000"
          className="flex-1"
        />
        <span className="mt-5 text-sm text-gray-600">원</span>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">이미지</label>
        <ImageGallery />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="text-sm">
          {isSaving ? '저장 중...' : '저장'}
        </Button>
      </div>
    </div>
  )
}
