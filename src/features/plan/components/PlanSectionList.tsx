import { useState, useCallback, useEffect, useMemo, type ReactNode } from 'react'
import type { PlanSection, SectionType } from '@/types'
import { ApiError } from '@/api'
import { MESSAGES } from '@/constants'
import { isTempId } from '@/lib/utils'
import { ExpandableSection } from '@/components/ui/ExpandableSection'
import { DraggableList } from '@/components/ui/DraggableList'
import { Button } from '@/components/ui/Button'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { getSectionRenderer } from '@/features/sections/registry'
import { usePlanStore } from '@/stores/usePlanStore'
import { usePendingChangesStore } from '@/stores/usePendingChangesStore'

function formatSectionTitle(section: PlanSection): string {
  const label = SECTION_TYPE_LABEL[section.type]
  return section.title ? `${label} (${section.title})` : label
}

const SECTION_TYPE_LABEL: Record<SectionType, string> = {
  flight: '비행기 정보',
  accommodation: '숙소 정보',
  activity: '액티비티 정보',
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
  const markSectionDeleted = usePendingChangesStore((s) => s.markSectionDeleted)
  const setSectionChange = usePendingChangesStore((s) => s.setSectionChange)
  const sections = usePendingChangesStore((s) => s.sections)
  const [localConfirmed, setLocalConfirmed] = useState(section.confirmed)

  // Sync confirmed state to pending store when it changes
  useEffect(() => {
    if (!isEditMode) return
    const existing = sections.get(section.id)
    if (existing) {
      setSectionChange(section.id, { ...existing, confirmed: localConfirmed })
    } else {
      setSectionChange(section.id, { id: section.id, confirmed: localConfirmed })
    }
  }, [localConfirmed]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!renderer) return null

  const { DisplayComponent, FormComponent } = renderer

  const handleDelete = () => {
    if (!confirm('이 섹션을 삭제하시겠습니까?')) return
    markSectionDeleted(section.id)
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
      {isEditMode ? (
        <div className="flex flex-col gap-3">
          <FormComponent section={section} sectionId={section.id} />
          <div className="flex justify-start">
            <Button
              variant="danger"
              className="px-3 py-1.5 text-xs"
              onClick={handleDelete}
            >
              섹션 삭제
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
  const reorderSections = usePlanStore((s) => s.reorderSections)
  const newSections = usePendingChangesStore((s) => s.newSections)
  const deletedSectionIds = usePendingChangesStore((s) => s.deletedSectionIds)
  const [reorderError, setReorderError] = useState<string | null>(null)

  const dismissReorderError = useCallback(() => setReorderError(null), [])

  // Compute working sections: (existing - deleted) + new
  const workingSections = useMemo(() => {
    const existing = sections.filter((s) => !deletedSectionIds.has(s.id))
    return [...existing, ...newSections]
  }, [sections, deletedSectionIds, newSections])

  const sorted = [...workingSections].sort((a, b) => a.order - b.order)

  const handleReorder = async (reordered: PlanSection[]) => {
    setReorderError(null)
    // Only send existing (non-temp) section IDs to the reorder API
    const existingIds = reordered.map((s) => s.id).filter((id) => !isTempId(id))
    if (existingIds.length === 0) return
    try {
      await reorderSections(existingIds)
    } catch (e) {
      if (e instanceof ApiError) {
        setReorderError(e.message)
      } else {
        setReorderError(MESSAGES.error.reorderFailed)
      }
    }
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
    </div>
  )
}
