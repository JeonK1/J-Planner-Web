import { useState, useEffect, useCallback } from 'react'
import type { TravelPlan } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { formatDate } from '@/lib/utils'
import { CONSTRAINTS, MESSAGES } from '@/constants'
import { usePendingChangesStore } from '@/stores/usePendingChangesStore'

interface PlanHeaderProps {
  plan: TravelPlan;
  isEditMode: boolean;
  isSaving?: boolean;
  saveError?: string | null;
  onRequestEdit: () => void;
  onExitEdit: () => void;
  onCancelEdit: () => void;
}

export function PlanHeader({
  plan,
  isEditMode,
  isSaving = false,
  saveError = null,
  onRequestEdit,
  onExitEdit,
  onCancelEdit,
}: PlanHeaderProps) {
  const [title, setTitle] = useState(plan.title)
  const [description, setDescription] = useState(plan.description)
  const [startDate, setStartDate] = useState(plan.startDate)
  const [endDate, setEndDate] = useState(plan.endDate)
  const [localError, setLocalError] = useState<string | null>(null)

  const setPlanInfo = usePendingChangesStore((s) => s.setPlanInfo)
  const registerValidator = usePendingChangesStore((s) => s.registerValidator)
  const unregisterValidator = usePendingChangesStore((s) => s.unregisterValidator)

  useEffect(() => {
    setTitle(plan.title)
    setDescription(plan.description)
    setStartDate(plan.startDate)
    setEndDate(plan.endDate)
  }, [plan])

  // Sync changes to pending store
  useEffect(() => {
    if (!isEditMode) return
    setPlanInfo({ title, description, startDate, endDate })
  }, [title, description, startDate, endDate, isEditMode, setPlanInfo])

  // Register plan-level validator
  useEffect(() => {
    if (!isEditMode) return
    registerValidator('__plan__', () => {
      if (title.trim().length > CONSTRAINTS.plan.titleMaxLength) {
        return MESSAGES.validation.titleMaxLength
      }
      return null
    })
    return () => unregisterValidator('__plan__')
  }, [isEditMode, title, registerValidator, unregisterValidator])

  const error = saveError || localError
  const dismissError = useCallback(() => setLocalError(null), [])

  return (
    <div className="mb-6">
      {error && (
        <div className="mb-4">
          <ErrorAlert message={error} onDismiss={dismissError} autoHideMs={5000} />
        </div>
      )}
      <div className="flex items-start justify-between">
        {isEditMode ? (
          <div className="flex flex-1 flex-col gap-3 mr-4">
            <Input
              label="여행 제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="여행 제목을 입력하세요"
              maxLength={CONSTRAINTS.plan.titleMaxLength}
            />
            <Input
              label="설명"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="간략한 설명을 입력하세요"
              maxLength={CONSTRAINTS.plan.descriptionMaxLength}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="시작일"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="종료일"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
            {plan.description && (
              <p className="mt-1 text-sm text-gray-600">{plan.description}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              {formatDate(plan.startDate)} ~ {formatDate(plan.endDate)}
            </p>
          </div>
        )}
        <div className="shrink-0 flex flex-col gap-2">
          {isEditMode ? (
            <>
              <Button variant="secondary" onClick={onExitEdit} disabled={isSaving} className="min-w-[5rem]">
                {isSaving ? '저장 중...' : '수정 완료'}
              </Button>
              <Button variant="ghost" onClick={onCancelEdit} disabled={isSaving}>
                수정 취소
              </Button>
            </>
          ) : (
            <Button onClick={onRequestEdit}>
              수정
            </Button>
          )}
        </div>
      </div>
      {isEditMode && (
        <div className="mt-4 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
          수정 모드입니다. 항목을 편집한 후 수정 완료 버튼을 눌러주세요.
        </div>
      )}
    </div>
  )
}
