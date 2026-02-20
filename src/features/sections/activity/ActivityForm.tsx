import { useMemo, useCallback } from 'react'
import type { SectionFormProps } from '../types'
import type { ActivityInfo } from '@/types'
import type { PatchPlanSectionInput } from '@/api'
import { Input } from '@/components/ui/Input'
import { CONSTRAINTS, MESSAGES } from '@/constants'
import { useSectionForm } from '../hooks/useSectionForm'

export function ActivityForm({ section, sectionId }: SectionFormProps) {
  const initial = section.activityInfo

  const toInput = useCallback((title: string, activity: Omit<ActivityInfo, 'id'>): Omit<PatchPlanSectionInput, 'id'> => {
    return { title, activityInfo: activity }
  }, [])

  const validate = useCallback((_title: string, activity: Omit<ActivityInfo, 'id'>): string | null => {
    if (activity.startTime && activity.endTime && activity.startTime >= activity.endTime) {
      return MESSAGES.validation.activityTimeRange
    }
    return null
  }, [])

  const { title, setTitle, data: activity, update, validationError } =
    useSectionForm<Omit<ActivityInfo, 'id'>>(
      section,
      {
        name: initial?.name ?? '',
        location: initial?.location ?? '',
        startTime: initial?.startTime ?? '',
        endTime: initial?.endTime ?? '',
        notes: initial?.notes ?? '',
        price: initial?.price,
      },
      sectionId,
      toInput,
      validate,
    )

  const timeError = useMemo(() => {
    if (activity.startTime && activity.endTime && activity.startTime >= activity.endTime) {
      return MESSAGES.validation.activityTimeRange
    }
    return null
  }, [activity.startTime, activity.endTime])

  return (
    <div className="flex flex-col gap-3">
      <Input
        label="섹션 제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="오사카 유니버셜 스튜디오"
        maxLength={CONSTRAINTS.plan.sectionTitleMaxLength}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="액티비티 이름"
          value={activity.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="유니버셜 스튜디오 재팬"
          maxLength={CONSTRAINTS.activity.nameMaxLength}
        />
        <Input
          label="위치"
          value={activity.location ?? ''}
          onChange={(e) => update({ location: e.target.value })}
          placeholder="오사카 코노하나구 ..."
          maxLength={CONSTRAINTS.activity.locationMaxLength}
        />
        <Input
          label="시작시간"
          type="datetime-local"
          value={activity.startTime ?? ''}
          onChange={(e) => update({ startTime: e.target.value })}
          error={timeError ?? undefined}
          errorBorderOnly
        />
        <Input
          label="끝나는시간"
          type="datetime-local"
          value={activity.endTime ?? ''}
          onChange={(e) => update({ endTime: e.target.value })}
          min={activity.startTime || undefined}
          error={timeError ?? undefined}
        />
        <Input
          label="메모"
          value={activity.notes ?? ''}
          onChange={(e) => update({ notes: e.target.value })}
          placeholder="참고 사항"
          className="sm:col-span-2"
          maxLength={CONSTRAINTS.activity.notesMaxLength}
        />
        <div className="flex items-center gap-2 sm:col-span-2">
          <Input
            label="가격"
            type="number"
            value={activity.price ?? ''}
            onChange={(e) => update({ price: e.target.value === '' ? undefined : Number(e.target.value) })}
            placeholder="50000"
            className="flex-1"
          />
          <span className="mt-5 text-sm text-gray-600">원</span>
        </div>
      </div>

      {validationError && (
        <p className="text-sm text-red-600">{validationError}</p>
      )}
    </div>
  )
}
