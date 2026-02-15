import { usePlan } from '@/features/plan/hooks/usePlan'
import { useEditMode } from '@/features/plan/hooks/useEditMode'
import { PlanHeader } from '@/features/plan/components/PlanHeader'
import { PlanSectionList } from '@/features/plan/components/PlanSectionList'
import { PasswordDialog } from '@/components/ui/PasswordDialog'
import { Button } from '@/components/ui/Button'
import { usePlanStore } from '@/stores/usePlanStore'

export function PlanPage() {
  const { plan, isLoading, planId, error } = usePlan()
  const loadPlan = usePlanStore((s) => s.loadPlan)
  const {
    isEditMode,
    isPasswordDialogOpen,
    requestEdit,
    handlePasswordSubmit,
    handleExitEdit,
    closePasswordDialog,
  } = useEditMode(planId)

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <p className="text-sm text-gray-500">불러오는 중...</p>
      </div>
    )
  }

  if (error && !plan) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-red-100 p-3">
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">연결 오류</p>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
          </div>
          <Button onClick={() => loadPlan(planId)}>
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  if (!plan) {
    return null
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <PlanHeader
        plan={plan}
        isEditMode={isEditMode}
        onRequestEdit={requestEdit}
        onExitEdit={handleExitEdit}
      />
      <PlanSectionList
        sections={plan.sections}
        isEditMode={isEditMode}
      />
      <PasswordDialog
        isOpen={isPasswordDialogOpen}
        onClose={closePasswordDialog}
        onSubmit={handlePasswordSubmit}
      />
    </div>
  )
}
