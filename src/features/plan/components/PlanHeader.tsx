import { useState, useEffect, useCallback } from 'react'
import type { TravelPlan } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { formatDate } from '@/lib/utils'
import { usePlanStore } from '@/stores/usePlanStore'
import { ApiError } from '@/api'
import { CONSTRAINTS, MESSAGES } from '@/constants'

interface PlanHeaderProps {
  plan: TravelPlan;
  isEditMode: boolean;
  onRequestEdit: () => void;
  onExitEdit: () => void;
}

export function PlanHeader({
  plan,
  isEditMode,
  onRequestEdit,
  onExitEdit,
}: PlanHeaderProps) {
  const updatePlanInfo = usePlanStore((s) => s.updatePlanInfo)
  const [title, setTitle] = useState(plan.title)
  const [description, setDescription] = useState(plan.description)
  const [startDate, setStartDate] = useState(plan.startDate)
  const [endDate, setEndDate] = useState(plan.endDate)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTitle(plan.title)
    setDescription(plan.description)
    setStartDate(plan.startDate)
    setEndDate(plan.endDate)
  }, [plan])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    if (title.trim().length > CONSTRAINTS.plan.titleMaxLength) {
      setError(MESSAGES.validation.titleMaxLength)
      setIsSaving(false)
      return
    }
    try {
      await updatePlanInfo({ title, description, startDate, endDate })
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message)
      } else {
        setError(MESSAGES.error.saveFailed)
      }
    }
    setIsSaving(false)
  }

  const dismissError = useCallback(() => setError(null), [])

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
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="text-sm"
              >
                {isSaving ? '저장 중...' : '저장'}
              </Button>
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
        <div className="shrink-0">
          {isEditMode ? (
            <Button variant="secondary" onClick={onExitEdit}>
              수정 완료
            </Button>
          ) : (
            <Button onClick={onRequestEdit}>
              수정
            </Button>
          )}
        </div>
      </div>
      {isEditMode && (
        <div className="mt-4 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
          수정 모드입니다. 각 항목을 편집한 후 저장 버튼을 눌러주세요.
        </div>
      )}
    </div>
  )
}
