import { useState } from 'react'
import type { SectionFormProps } from '../types'
import type { FlightInfo } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function FlightForm({ section, onSave }: SectionFormProps) {
  const initial = section.flightInfo
  const [title, setTitle] = useState(section.title)
  const [flight, setFlight] = useState<Omit<FlightInfo, 'id'>>({
    airline: initial?.airline ?? '',
    flightNumber: initial?.flightNumber ?? '',
    departureAirport: initial?.departureAirport ?? '',
    arrivalAirport: initial?.arrivalAirport ?? '',
    departureTime: initial?.departureTime ?? '',
    arrivalTime: initial?.arrivalTime ?? '',
    bookingReference: initial?.bookingReference ?? '',
    notes: initial?.notes ?? '',
  })
  const [isSaving, setIsSaving] = useState(false)

  const update = (updates: Partial<Omit<FlightInfo, 'id'>>) => {
    setFlight((prev) => ({ ...prev, ...updates }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    await onSave({ title, flightInfo: flight })
    setIsSaving(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        label="섹션 제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="인천 → 나리타"
      />
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
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="text-sm">
          {isSaving ? '저장 중...' : '저장'}
        </Button>
      </div>
    </div>
  )
}
