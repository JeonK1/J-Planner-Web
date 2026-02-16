import { useMemo } from 'react'
import type { SectionFormProps } from '../types'
import type { FlightFormData, FlightLegFormData, TripType } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ImageGallery } from '@/components/ui/ImageGallery'
import { CONSTRAINTS, MESSAGES } from '@/constants'
import { useSectionForm } from '../hooks/useSectionForm'

function emptyLeg(): FlightLegFormData {
  return {
    airline: '',
    flightNumber: '',
    departureAirport: '',
    arrivalAirport: '',
    departureTime: '',
    arrivalTime: '',
    bookingReference: '',
    notes: '',
  }
}

function toFormData(info: FlightFormData | undefined): FlightFormData {
  if (info) return info
  return {
    tripType: 'oneWay',
    legs: [emptyLeg()],
  }
}

function flightInfoToFormData(info: import('@/types').FlightInfo): FlightFormData {
  return {
    tripType: info.tripType,
    legs: info.legs.map((leg) => ({
      airline: leg.airline,
      flightNumber: leg.flightNumber,
      departureAirport: leg.departureAirport,
      arrivalAirport: leg.arrivalAirport,
      departureTime: leg.departureTime,
      arrivalTime: leg.arrivalTime,
      bookingReference: leg.bookingReference ?? '',
      notes: leg.notes ?? '',
    })),
    price: info.price,
  }
}

export function FlightForm({ section, onSave }: SectionFormProps) {
  const { title, setTitle, data: flight, update, isSaving, validationError, save } =
    useSectionForm<FlightFormData>(
      section,
      section.flightInfo ? flightInfoToFormData(section.flightInfo) : toFormData(undefined),
      onSave,
    )

  const isRoundTrip = flight.tripType === 'roundTrip'

  const legTimeErrors = useMemo(() => {
    return flight.legs.map((leg) => {
      if (leg.departureTime && leg.arrivalTime && leg.departureTime >= leg.arrivalTime) {
        return MESSAGES.validation.flightTimeRange
      }
      return null
    })
  }, [flight.legs])

  const updateLeg = (index: number, partial: Partial<FlightLegFormData>) => {
    const newLegs = flight.legs.map((leg, i) =>
      i === index ? { ...leg, ...partial } : leg,
    )
    update({ legs: newLegs })
  }

  const handleTripTypeChange = (tripType: TripType) => {
    if (tripType === 'oneWay') {
      update({ tripType, legs: [flight.legs[0]] })
    } else {
      update({ tripType, legs: [...flight.legs, emptyLeg()] })
    }
  }

  const handleSave = () => {
    save(
      () => {
        for (let i = 0; i < flight.legs.length; i++) {
          const leg = flight.legs[i]
          if (leg.departureTime && leg.arrivalTime && leg.departureTime >= leg.arrivalTime) {
            return MESSAGES.validation.flightLegTimeRange(i)
          }
        }
        return null
      },
      () => ({ title, flightInfo: flight }),
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="섹션 제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="인천 ↔ 나리타"
        maxLength={CONSTRAINTS.plan.sectionTitleMaxLength}
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
          value={flight.legs[0].airline}
          onChange={(e) => updateLeg(0, { airline: e.target.value })}
          placeholder="대한항공"
          maxLength={CONSTRAINTS.flightLeg.airlineMaxLength}
        />
        <Input
          label="편명"
          value={flight.legs[0].flightNumber}
          onChange={(e) => updateLeg(0, { flightNumber: e.target.value })}
          placeholder="KE001"
          maxLength={CONSTRAINTS.flightLeg.flightNumberMaxLength}
        />
        <Input
          label="출발 공항"
          value={flight.legs[0].departureAirport}
          onChange={(e) => updateLeg(0, { departureAirport: e.target.value })}
          placeholder="ICN"
          maxLength={CONSTRAINTS.flightLeg.airportMaxLength}
        />
        <Input
          label="도착 공항"
          value={flight.legs[0].arrivalAirport}
          onChange={(e) => updateLeg(0, { arrivalAirport: e.target.value })}
          placeholder="NRT"
          maxLength={CONSTRAINTS.flightLeg.airportMaxLength}
        />
        <Input
          label="출발 시간"
          type="datetime-local"
          value={flight.legs[0].departureTime}
          onChange={(e) => updateLeg(0, { departureTime: e.target.value })}
          error={legTimeErrors[0] ?? undefined}
          errorBorderOnly
        />
        <Input
          label="도착 시간"
          type="datetime-local"
          value={flight.legs[0].arrivalTime}
          onChange={(e) => updateLeg(0, { arrivalTime: e.target.value })}
          min={flight.legs[0].departureTime || undefined}
          error={legTimeErrors[0] ?? undefined}
        />
        <Input
          label="예약번호"
          value={flight.legs[0].bookingReference}
          onChange={(e) => updateLeg(0, { bookingReference: e.target.value })}
          placeholder="ABC123"
          maxLength={CONSTRAINTS.flightLeg.bookingReferenceMaxLength}
        />
        <Input
          label="메모"
          value={flight.legs[0].notes}
          onChange={(e) => updateLeg(0, { notes: e.target.value })}
          placeholder="참고 사항"
          maxLength={CONSTRAINTS.flightLeg.notesMaxLength}
        />
      </div>

      {isRoundTrip && flight.legs[1] && (
        <>
          <div className="border-t border-gray-200 pt-4">
            <div className="mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              입국
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="항공사"
                value={flight.legs[1].airline}
                onChange={(e) => updateLeg(1, { airline: e.target.value })}
                placeholder="대한항공"
                maxLength={CONSTRAINTS.flightLeg.airlineMaxLength}
              />
              <Input
                label="편명"
                value={flight.legs[1].flightNumber}
                onChange={(e) => updateLeg(1, { flightNumber: e.target.value })}
                placeholder="KE002"
                maxLength={CONSTRAINTS.flightLeg.flightNumberMaxLength}
              />
              <Input
                label="출발 공항"
                value={flight.legs[1].departureAirport}
                onChange={(e) => updateLeg(1, { departureAirport: e.target.value })}
                placeholder="NRT"
                maxLength={CONSTRAINTS.flightLeg.airportMaxLength}
              />
              <Input
                label="도착 공항"
                value={flight.legs[1].arrivalAirport}
                onChange={(e) => updateLeg(1, { arrivalAirport: e.target.value })}
                placeholder="ICN"
                maxLength={CONSTRAINTS.flightLeg.airportMaxLength}
              />
              <Input
                label="출발 시간"
                type="datetime-local"
                value={flight.legs[1].departureTime}
                onChange={(e) => updateLeg(1, { departureTime: e.target.value })}
                error={legTimeErrors[1] ?? undefined}
                errorBorderOnly
              />
              <Input
                label="도착 시간"
                type="datetime-local"
                value={flight.legs[1].arrivalTime}
                onChange={(e) => updateLeg(1, { arrivalTime: e.target.value })}
                min={flight.legs[1].departureTime || undefined}
                error={legTimeErrors[1] ?? undefined}
              />
              <Input
                label="예약번호"
                value={flight.legs[1].bookingReference}
                onChange={(e) => updateLeg(1, { bookingReference: e.target.value })}
                placeholder="ABC123"
                maxLength={CONSTRAINTS.flightLeg.bookingReferenceMaxLength}
              />
              <Input
                label="메모"
                value={flight.legs[1].notes}
                onChange={(e) => updateLeg(1, { notes: e.target.value })}
                placeholder="참고 사항"
                maxLength={CONSTRAINTS.flightLeg.notesMaxLength}
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

      {validationError && (
        <p className="text-sm text-red-600">{validationError}</p>
      )}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="text-sm">
          {isSaving ? '저장 중...' : '저장'}
        </Button>
      </div>
    </div>
  )
}
