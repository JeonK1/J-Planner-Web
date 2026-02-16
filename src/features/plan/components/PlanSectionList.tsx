import { useState, useCallback, type ReactNode } from 'react'
import type { PlanSection, SectionType } from '@/types'
import { ApiError } from '@/api'
import { MESSAGES } from '@/constants'
import type { UpdateSectionInput } from '@/api'
import { ExpandableSection } from '@/components/ui/ExpandableSection'
import { DraggableList } from '@/components/ui/DraggableList'
import { Button } from '@/components/ui/Button'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { getSectionRenderer } from '@/features/sections/registry'
import { usePlanStore } from '@/stores/usePlanStore'

function formatSectionTitle(section: PlanSection): string {
  const label = SECTION_TYPE_LABEL[section.type]
  const detail =
    section.type === 'accommodation' && section.accommodationInfo?.name
      ? section.accommodationInfo.name
      : section.title
  return `${label} (${detail})`
}

const SECTION_TYPE_LABEL: Record<SectionType, string> = {
  flight: '비행기 정보',
  accommodation: '숙소 정보',
}

interface PlanSectionListProps {
  sections: PlanSection[];
  isEditMode: boolean;
}

function SectionItem({
  section,
  isEditMode,
  dragHandle,
}: {
  section: PlanSection;
  isEditMode: boolean;
  dragHandle: ReactNode;
}) {
  const renderer = getSectionRenderer(section.type)
  const updateSection = usePlanStore((s) => s.updateSection)
  const removeSection = usePlanStore((s) => s.removeSection)
  const [isDeleting, setIsDeleting] = useState(false)
  const [localConfirmed, setLocalConfirmed] = useState(section.confirmed)
  const [error, setError] = useState<string | null>(null)

  const dismissError = useCallback(() => setError(null), [])

  if (!renderer) return null

  const { DisplayComponent, FormComponent } = renderer

  const handleSave = async (input: UpdateSectionInput) => {
    setError(null)
    try {
      await updateSection(section.id, { ...input, confirmed: localConfirmed })
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message)
      } else {
        setError(MESSAGES.error.saveFailed)
      }
    }
  }

  const handleDelete = async () => {
    if (!confirm('이 섹션을 삭제하시겠습니까?')) return
    setIsDeleting(true)
    setError(null)
    try {
      await removeSection(section.id)
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message)
      } else {
        setError(MESSAGES.error.deleteFailed)
      }
      setIsDeleting(false)
    }
  }

  const headerRight = isEditMode ? (
    <label className="flex items-center gap-1.5 text-sm">
      <input
        type="checkbox"
        checked={localConfirmed}
        onChange={() => setLocalConfirmed((prev) => !prev)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="font-medium text-gray-600">확정</span>
    </label>
  ) : (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
      section.confirmed
        ? 'bg-blue-100 text-blue-700'
        : 'bg-gray-100 text-gray-600'
    }`}>
      {section.confirmed ? '확정' : '후보'}
    </span>
  )

  return (
    <ExpandableSection
      title={formatSectionTitle(section)}
      defaultExpanded
      headerLeft={dragHandle}
      headerRight={headerRight}
    >
      {error && (
        <div className="mb-3">
          <ErrorAlert message={error} onDismiss={dismissError} autoHideMs={5000} />
        </div>
      )}
      {isEditMode ? (
        <div className="flex flex-col gap-3">
          <FormComponent section={section} onSave={handleSave} />
          <div className="flex justify-start">
            <Button
              variant="danger"
              className="px-3 py-1.5 text-xs"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? '삭제 중...' : '섹션 삭제'}
            </Button>
          </div>
        </div>
      ) : (
        <DisplayComponent section={section} />
      )}
    </ExpandableSection>
  )
}

export function PlanSectionList({ sections, isEditMode }: PlanSectionListProps) {
  const addSection = usePlanStore((s) => s.addSection)
  const reorderSections = usePlanStore((s) => s.reorderSections)
  const [isAdding, setIsAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [reorderError, setReorderError] = useState<string | null>(null)
  const sorted = [...sections].sort((a, b) => a.order - b.order)

  const dismissAddError = useCallback(() => setAddError(null), [])
  const dismissReorderError = useCallback(() => setReorderError(null), [])

  const handleReorder = async (reordered: PlanSection[]) => {
    setReorderError(null)
    try {
      await reorderSections(reordered.map((s) => s.id))
    } catch (e) {
      if (e instanceof ApiError) {
        setReorderError(e.message)
      } else {
        setReorderError(MESSAGES.error.reorderFailed)
      }
    }
  }

  const handleAddSection = async (type: 'flight' | 'accommodation', title: string) => {
    setIsAdding(true)
    setAddError(null)
    try {
      await addSection(type, title)
    } catch (e) {
      if (e instanceof ApiError) {
        setAddError(e.message)
      } else {
        setAddError(MESSAGES.error.addSectionFailed)
      }
    }
    setIsAdding(false)
  }

  if (sorted.length === 0 && !isEditMode) {
    return (
      <p className="text-center text-sm text-gray-500">
        등록된 섹션이 없습니다.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {reorderError && (
        <ErrorAlert message={reorderError} onDismiss={dismissReorderError} autoHideMs={5000} />
      )}
      <DraggableList
        items={sorted}
        keyExtractor={(s) => s.id}
        enabled={isEditMode}
        onReorder={handleReorder}
        renderItem={(section, _index, dragHandle) => (
          <SectionItem
            section={section}
            isEditMode={isEditMode}
            dragHandle={dragHandle}
          />
        )}
      />
      {isEditMode && (
        <>
          {addError && (
            <ErrorAlert message={addError} onDismiss={dismissAddError} autoHideMs={5000} />
          )}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => handleAddSection('flight', '새 비행기 정보')}
              disabled={isAdding}
            >
              + 비행기 추가
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleAddSection('accommodation', '새 숙소 정보')}
              disabled={isAdding}
            >
              + 숙소 추가
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
