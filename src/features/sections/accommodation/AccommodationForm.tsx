import { useMemo } from 'react'
import type { SectionFormProps } from '../types'
import type { AccommodationInfo } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ImageGallery } from '@/components/ui/ImageGallery'
import { CONSTRAINTS, MESSAGES } from '@/constants'
import { useSectionForm } from '../hooks/useSectionForm'

export function AccommodationForm({ section, onSave }: SectionFormProps) {
  const initial = section.accommodationInfo
  const { title, setTitle, data: acc, update, isSaving, validationError, save } =
    useSectionForm<Omit<AccommodationInfo, 'id'>>(
      section,
      {
        name: initial?.name ?? '',
        address: initial?.address ?? '',
        checkIn: initial?.checkIn ?? '',
        checkOut: initial?.checkOut ?? '',
        bookingReference: initial?.bookingReference ?? '',
        contactNumber: initial?.contactNumber ?? '',
        notes: initial?.notes ?? '',
        price: initial?.price,
      },
      onSave,
    )

  const dateError = useMemo(() => {
    if (acc.checkIn && acc.checkOut && acc.checkIn >= acc.checkOut) {
      return MESSAGES.validation.accommodationDateRange
    }
    return null
  }, [acc.checkIn, acc.checkOut])

  const handleSave = () => {
    save(
      () => {
        if (acc.checkIn && acc.checkOut && acc.checkIn >= acc.checkOut) {
          return MESSAGES.validation.accommodationDateRange
        }
        return null
      },
      () => ({ title, accommodationInfo: acc }),
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        label="섹션 제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="도쿄 호텔"
        maxLength={CONSTRAINTS.plan.sectionTitleMaxLength}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="숙소명"
          value={acc.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="신주쿠 워싱턴 호텔"
          maxLength={CONSTRAINTS.accommodation.nameMaxLength}
        />
        <Input
          label="주소"
          value={acc.address}
          onChange={(e) => update({ address: e.target.value })}
          placeholder="도쿄 신주쿠구 ..."
          maxLength={CONSTRAINTS.accommodation.addressMaxLength}
        />
        <Input
          label="체크인"
          type="date"
          value={acc.checkIn}
          onChange={(e) => update({ checkIn: e.target.value })}
          error={dateError ?? undefined}
          errorBorderOnly
        />
        <Input
          label="체크아웃"
          type="date"
          value={acc.checkOut}
          onChange={(e) => update({ checkOut: e.target.value })}
          min={acc.checkIn || undefined}
          error={dateError ?? undefined}
        />
        <Input
          label="예약번호"
          value={acc.bookingReference ?? ''}
          onChange={(e) => update({ bookingReference: e.target.value })}
          placeholder="HTL-001"
          maxLength={CONSTRAINTS.accommodation.bookingReferenceMaxLength}
        />
        <Input
          label="연락처"
          value={acc.contactNumber ?? ''}
          onChange={(e) => update({ contactNumber: e.target.value })}
          placeholder="+81-3-1234-5678"
          maxLength={CONSTRAINTS.accommodation.contactNumberMaxLength}
        />
        <Input
          label="메모"
          value={acc.notes ?? ''}
          onChange={(e) => update({ notes: e.target.value })}
          placeholder="참고 사항"
          className="sm:col-span-2"
          maxLength={CONSTRAINTS.accommodation.notesMaxLength}
        />
        <div className="flex items-center gap-2 sm:col-span-2">
          <Input
            label="가격"
            type="number"
            value={acc.price ?? ''}
            onChange={(e) => update({ price: e.target.value === '' ? undefined : Number(e.target.value) })}
            placeholder="890000"
            className="flex-1"
          />
          <span className="mt-5 text-sm text-gray-600">원</span>
        </div>
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
