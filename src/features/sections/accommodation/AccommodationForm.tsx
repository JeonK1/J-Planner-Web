import { useState } from 'react'
import type { SectionFormProps } from '../types'
import type { AccommodationInfo } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function AccommodationForm({ section, onSave }: SectionFormProps) {
  const initial = section.accommodationInfo
  const [title, setTitle] = useState(section.title)
  const [acc, setAcc] = useState<Omit<AccommodationInfo, 'id'>>({
    name: initial?.name ?? '',
    address: initial?.address ?? '',
    checkIn: initial?.checkIn ?? '',
    checkOut: initial?.checkOut ?? '',
    bookingReference: initial?.bookingReference ?? '',
    contactNumber: initial?.contactNumber ?? '',
    notes: initial?.notes ?? '',
  })
  const [isSaving, setIsSaving] = useState(false)

  const update = (updates: Partial<Omit<AccommodationInfo, 'id'>>) => {
    setAcc((prev) => ({ ...prev, ...updates }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    await onSave({ title, accommodationInfo: acc })
    setIsSaving(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        label="섹션 제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="도쿄 호텔"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="숙소명"
          value={acc.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="신주쿠 워싱턴 호텔"
        />
        <Input
          label="주소"
          value={acc.address}
          onChange={(e) => update({ address: e.target.value })}
          placeholder="도쿄 신주쿠구 ..."
        />
        <Input
          label="체크인"
          type="date"
          value={acc.checkIn}
          onChange={(e) => update({ checkIn: e.target.value })}
        />
        <Input
          label="체크아웃"
          type="date"
          value={acc.checkOut}
          onChange={(e) => update({ checkOut: e.target.value })}
        />
        <Input
          label="예약번호"
          value={acc.bookingReference ?? ''}
          onChange={(e) => update({ bookingReference: e.target.value })}
          placeholder="HTL-001"
        />
        <Input
          label="연락처"
          value={acc.contactNumber ?? ''}
          onChange={(e) => update({ contactNumber: e.target.value })}
          placeholder="+81-3-1234-5678"
        />
        <Input
          label="메모"
          value={acc.notes ?? ''}
          onChange={(e) => update({ notes: e.target.value })}
          placeholder="참고 사항"
          className="sm:col-span-2"
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
