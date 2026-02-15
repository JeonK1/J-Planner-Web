import type { SectionDisplayProps } from '../types'
import { formatDate } from '@/lib/utils'

export function AccommodationDisplay({ section }: SectionDisplayProps) {
  const acc = section.accommodationInfo

  if (!acc) {
    return <p className="text-sm text-gray-500">숙소 정보가 없습니다.</p>
  }

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <div className="mb-2">
        <span className="text-sm font-semibold text-green-700">{acc.name}</span>
      </div>
      {acc.address && (
        <div className="mb-1 text-sm text-gray-600">{acc.address}</div>
      )}
      {(acc.checkIn || acc.checkOut) && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {acc.checkIn && <span>{formatDate(acc.checkIn)}</span>}
          {acc.checkIn && acc.checkOut && <span>~</span>}
          {acc.checkOut && <span>{formatDate(acc.checkOut)}</span>}
        </div>
      )}
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
    </div>
  )
}
