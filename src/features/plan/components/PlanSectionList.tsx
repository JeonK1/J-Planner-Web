import { useState, useCallback } from 'react'
import type { PlanSection } from '@/types'
import type { UpdateSectionInput } from '@/api'
import { ExpandableSection } from '@/components/ui/ExpandableSection'
import { Button } from '@/components/ui/Button'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { getSectionRenderer } from '@/features/sections/registry'
import { usePlanStore } from '@/stores/usePlanStore'

interface PlanSectionListProps {
  sections: PlanSection[];
  isEditMode: boolean;
}

function SectionItem({
  section,
  isEditMode,
}: {
  section: PlanSection;
  isEditMode: boolean;
}) {
  const renderer = getSectionRenderer(section.type)
  const updateSection = usePlanStore((s) => s.updateSection)
  const removeSection = usePlanStore((s) => s.removeSection)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dismissError = useCallback(() => setError(null), [])

  if (!renderer) return null

  const { DisplayComponent, FormComponent } = renderer

  const handleSave = async (input: UpdateSectionInput) => {
    setError(null)
    try {
      await updateSection(section.id, input)
    } catch {
      setError('저장에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const handleDelete = async () => {
    if (!confirm('이 섹션을 삭제하시겠습니까?')) return
    setIsDeleting(true)
    setError(null)
    try {
      await removeSection(section.id)
    } catch {
      setError('삭제에 실패했습니다. 다시 시도해주세요.')
      setIsDeleting(false)
    }
  }

  return (
    <ExpandableSection title={section.title} defaultExpanded>
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
  const [isAdding, setIsAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const sorted = [...sections].sort((a, b) => a.order - b.order)

  const dismissAddError = useCallback(() => setAddError(null), [])

  const handleAddSection = async (type: 'flight' | 'accommodation', title: string) => {
    setIsAdding(true)
    setAddError(null)
    try {
      await addSection(type, title)
    } catch {
      setAddError('섹션 추가에 실패했습니다. 다시 시도해주세요.')
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
      {sorted.map((section) => (
        <SectionItem
          key={section.id}
          section={section}
          isEditMode={isEditMode}
        />
      ))}
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
