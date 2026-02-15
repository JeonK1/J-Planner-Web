import type { SectionDisplayProps } from '../types'
import type { AccommodationSectionData } from '@/types'
import { formatDate } from '@/lib/utils'
import { ImageGallery } from '@/components/ui/ImageGallery'

export function AccommodationDisplay({ data }: SectionDisplayProps) {
  const accommodationData = data as AccommodationSectionData

  if (accommodationData.accommodations.length === 0) {
    return <p className="text-sm text-gray-500">등록된 숙소 정보가 없습니다.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {accommodationData.accommodations.map((acc) => (
        <div
          key={acc.id}
          className="rounded-lg border border-gray-100 bg-gray-50 p-4"
        >
          <div className="mb-2">
            <span className="text-sm font-semibold text-green-700">{acc.name}</span>
          </div>
          <div className="mb-1 text-sm text-gray-600">{acc.address}</div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{formatDate(acc.checkIn)}</span>
            <span>~</span>
            <span>{formatDate(acc.checkOut)}</span>
          </div>
          {(acc.bookingReference || acc.contactNumber || acc.notes) && (
            <div className="mt-2 flex flex-col gap-1 border-t border-gray-200 pt-2 text-xs text-gray-500">
              {acc.bookingReference && (
                <span>예약번호: {acc.bookingReference}</span>
              )}
              {acc.contactNumber && (
                <span>연락처: {acc.contactNumber}</span>
              )}
              {acc.notes && <span>{acc.notes}</span>}
            </div>
          )}
          {acc.images && acc.images.length > 0 && (
            <ImageGallery images={acc.images} />
          )}
        </div>
      ))}
    </div>
  )
}
