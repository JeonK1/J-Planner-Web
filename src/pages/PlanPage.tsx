import { usePlan } from '@/features/plan/hooks/usePlan'
import { useEditMode } from '@/features/plan/hooks/useEditMode'
import { PlanHeader } from '@/features/plan/components/PlanHeader'
import { PlanTimeline } from '@/features/plan/components/PlanTimeline'
import { PlanSectionList } from '@/features/plan/components/PlanSectionList'
import { PasswordDialog } from '@/components/ui/PasswordDialog'
import { ConnectionError } from '@/components/ui/ConnectionError'
import { usePlanStore } from '@/stores/usePlanStore'

export function PlanPage() {
  const { plan, isLoading, accessCode, error } = usePlan()
  const loadPlan = usePlanStore((s) => s.loadPlan)
  const {
    isEditMode,
    isPasswordDialogOpen,
    requestEdit,
    handlePasswordSubmit,
    handleExitEdit,
    closePasswordDialog,
  } = useEditMode(accessCode)

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <p className="text-sm text-gray-500">불러오는 중...</p>
      </div>
    )
  }

  if (error && !plan) {
    return <ConnectionError message={error} onRetry={() => loadPlan(accessCode)} />
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
      <PlanTimeline plan={plan} />
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
