import type { SectionFormProps } from '../types'
import type { AccommodationSectionData, AccommodationInfo } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ImageUploader } from '@/components/ui/ImageUploader'
import { generateId } from '@/lib/utils'

export function AccommodationForm({ data, onChange }: SectionFormProps) {
  const accommodationData = data as AccommodationSectionData

  const updateAccommodation = (accId: string, updates: Partial<AccommodationInfo>) => {
    onChange({
      ...accommodationData,
      accommodations: accommodationData.accommodations.map((a) =>
        a.id === accId ? { ...a, ...updates } : a,
      ),
    })
  }

  const addAccommodation = () => {
    const newAcc: AccommodationInfo = {
      id: generateId(),
      name: '',
      address: '',
      checkIn: '',
      checkOut: '',
    }
    onChange({
      ...accommodationData,
      accommodations: [...accommodationData.accommodations, newAcc],
    })
  }

  const removeAccommodation = (accId: string) => {
    onChange({
      ...accommodationData,
      accommodations: accommodationData.accommodations.filter((a) => a.id !== accId),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {accommodationData.accommodations.map((acc, index) => (
        <div
          key={acc.id}
          className="rounded-lg border border-gray-200 bg-gray-50 p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              숙소 {index + 1}
            </span>
            <Button
              type="button"
              variant="danger"
              className="px-2 py-1 text-xs"
              onClick={() => removeAccommodation(acc.id)}
            >
              삭제
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="숙소명"
              value={acc.name}
              onChange={(e) => updateAccommodation(acc.id, { name: e.target.value })}
              placeholder="신주쿠 워싱턴 호텔"
            />
            <Input
              label="주소"
              value={acc.address}
              onChange={(e) => updateAccommodation(acc.id, { address: e.target.value })}
              placeholder="도쿄 신주쿠구 ..."
            />
            <Input
              label="체크인"
              type="date"
              value={acc.checkIn}
              onChange={(e) => updateAccommodation(acc.id, { checkIn: e.target.value })}
            />
            <Input
              label="체크아웃"
              type="date"
              value={acc.checkOut}
              onChange={(e) => updateAccommodation(acc.id, { checkOut: e.target.value })}
            />
            <Input
              label="예약번호"
              value={acc.bookingReference ?? ''}
              onChange={(e) => updateAccommodation(acc.id, { bookingReference: e.target.value })}
              placeholder="HTL-001"
            />
            <Input
              label="연락처"
              value={acc.contactNumber ?? ''}
              onChange={(e) => updateAccommodation(acc.id, { contactNumber: e.target.value })}
              placeholder="+81-3-1234-5678"
            />
            <Input
              label="메모"
              value={acc.notes ?? ''}
              onChange={(e) => updateAccommodation(acc.id, { notes: e.target.value })}
              placeholder="참고 사항"
              className="sm:col-span-2"
            />
          </div>
          <div className="mt-3">
            <ImageUploader
              images={acc.images ?? []}
              onChange={(images) => updateAccommodation(acc.id, { images })}
            />
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={addAccommodation}
        className="self-start"
      >
        + 숙소 추가
      </Button>
    </div>
  )
}
