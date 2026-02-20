import { useState, useCallback, useRef } from 'react'
import { usePlan } from '@/features/plan/hooks/usePlan'
import { useEditMode } from '@/features/plan/hooks/useEditMode'
import { PlanHeader } from '@/features/plan/components/PlanHeader'
import { PlanTimeline } from '@/features/plan/components/PlanTimeline'
import { PlanSectionList } from '@/features/plan/components/PlanSectionList'
import { PasswordDialog } from '@/components/ui/PasswordDialog'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ConnectionError } from '@/components/ui/ConnectionError'
import { usePlanStore } from '@/stores/usePlanStore'
import { usePendingChangesStore } from '@/stores/usePendingChangesStore'
import { patchPlan } from '@/api/planApi'
import { ApiError } from '@/api/client'
import { MESSAGES } from '@/constants'

export function PlanPage() {
  const { plan, isLoading, accessCode, error } = usePlan()
  const loadPlan = usePlanStore((s) => s.loadPlan)
  const applyPatchResult = usePlanStore((s) => s.applyPatchResult)
  const {
    isEditMode,
    isPasswordDialogOpen,
    requestEdit,
    handlePasswordSubmit,
    handleExitEdit,
    closePasswordDialog,
  } = useEditMode(accessCode)

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  const sectionListRef = useRef<HTMLDivElement>(null)
  const pendingStore = usePendingChangesStore

  const handleSaveAndExit = useCallback(async () => {
    if (!plan) return

    setSaveError(null)

    // Validate all forms
    const validationError = pendingStore.getState().validateAll()
    if (validationError) {
      setSaveError(validationError)
      return
    }

    // Build payload
    const payload = pendingStore.getState().buildPayload(plan)

    // If no changes, just exit edit mode
    if (
      !payload.plan
      && (!payload.sections || payload.sections.length === 0)
      && (!payload.newSections || payload.newSections.length === 0)
      && (!payload.deletedSectionIds || payload.deletedSectionIds.length === 0)
    ) {
      pendingStore.getState().clear()
      handleExitEdit()
      return
    }

    setIsSaving(true)
    try {
      const updatedPlan = await patchPlan(accessCode, payload)
      applyPatchResult(updatedPlan)
      pendingStore.getState().clear()
      handleExitEdit()
    } catch (e) {
      if (e instanceof ApiError) {
        setSaveError(e.message)
      } else {
        setSaveError(MESSAGES.error.saveFailed)
      }
    }
    setIsSaving(false)
  }, [plan, accessCode, applyPatchResult, handleExitEdit, pendingStore])

  const handleRequestEdit = useCallback(() => {
    pendingStore.getState().clear()
    setSaveError(null)
    requestEdit()
  }, [requestEdit, pendingStore])

  const handleCancelEdit = useCallback(() => {
    setIsCancelDialogOpen(true)
  }, [])

  const handleAddSection = useCallback((type: 'flight' | 'accommodation' | 'activity') => {
    const newSection = pendingStore.getState().addNewSection(type, '')
    requestAnimationFrame(() => {
      const el = sectionListRef.current?.querySelector(`[data-item-key="${newSection.id}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }, [pendingStore])

  const handleConfirmCancel = useCallback(() => {
    setIsCancelDialogOpen(false)
    pendingStore.getState().clear()
    handleExitEdit()
  }, [pendingStore, handleExitEdit])

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
        isSaving={isSaving}
        saveError={saveError}
        onRequestEdit={handleRequestEdit}
        onExitEdit={handleSaveAndExit}
        onCancelEdit={handleCancelEdit}
      />
      <PlanTimeline plan={plan} isEditMode={isEditMode} />
      {isEditMode && (
        <div className="mb-6 flex gap-2">
          <Button
            variant="secondary"
            onClick={() => handleAddSection('flight')}
          >
            + 비행기 추가
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleAddSection('accommodation')}
          >
            + 숙소 추가
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleAddSection('activity')}
          >
            + 액티비티 추가
          </Button>
        </div>
      )}
      <div ref={sectionListRef}>
      <PlanSectionList
        sections={plan.sections}
        isEditMode={isEditMode}
      />
      </div>
      <PasswordDialog
        isOpen={isPasswordDialogOpen}
        onClose={closePasswordDialog}
        onSubmit={handlePasswordSubmit}
      />
      <Modal
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        title="수정 취소"
      >
        <p className="mb-6 text-sm text-gray-600">
          변경사항이 저장되지 않습니다. 정말 나가시겠습니까?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setIsCancelDialogOpen(false)}>
            계속 수정
          </Button>
          <Button variant="danger" onClick={handleConfirmCancel}>
            나가기
          </Button>
        </div>
      </Modal>
    </div>
  )
}
