import type { SectionDisplayProps } from '../types'
import { formatDateTime } from '@/lib/utils'

export function ActivityDisplay({ section }: SectionDisplayProps) {
  const activity = section.activityInfo

  if (!activity) {
    return <p className="text-sm text-gray-500">액티비티 정보가 없습니다.</p>
  }

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <div className="mb-2">
        <span className="text-sm font-semibold text-orange-700">{activity.name}</span>
      </div>
      {activity.location && (
        <div className="mb-1 text-sm text-gray-600">{activity.location}</div>
      )}
      {(activity.startTime || activity.endTime) && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {activity.startTime && <span>{formatDateTime(activity.startTime)}</span>}
          {activity.startTime && activity.endTime && <span>~</span>}
          {activity.endTime && <span>{formatDateTime(activity.endTime)}</span>}
        </div>
      )}
      {(activity.price != null || activity.notes) && (
        <div className="mt-2 flex flex-col gap-1 border-t border-gray-200 pt-2 text-xs text-gray-500">
          {activity.price != null && (
            <span className="font-medium text-gray-700">가격: {activity.price.toLocaleString()}원</span>
          )}
          {activity.notes && <span>{activity.notes}</span>}
        </div>
      )}
    </div>
  )
}
