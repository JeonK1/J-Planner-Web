import type { TravelPlan } from '@/types'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

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
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
          {plan.description && (
            <p className="mt-1 text-sm text-gray-600">{plan.description}</p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            {formatDate(plan.startDate)} ~ {formatDate(plan.endDate)}
          </p>
        </div>
        <div>
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
          수정 모드입니다. 섹션을 편집한 후 각 섹션의 저장 버튼을 눌러주세요.
        </div>
      )}
    </div>
  )
}
