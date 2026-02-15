import { useState } from 'react'
import type { PlanSection, SectionData } from '@/types'
import { ExpandableSection } from '@/components/ui/ExpandableSection'
import { Button } from '@/components/ui/Button'
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
  const [editData, setEditData] = useState<SectionData>(section.data)
  const [isSaving, setIsSaving] = useState(false)

  if (!renderer) return null

  const { DisplayComponent, FormComponent } = renderer

  const handleSave = async () => {
    setIsSaving(true)
    await updateSection(section.id, editData)
    setIsSaving(false)
  }

  return (
    <ExpandableSection title={section.title} defaultExpanded>
      {isEditMode ? (
        <div className="flex flex-col gap-3">
          <FormComponent data={editData} onChange={setEditData} />
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
        <DisplayComponent data={section.data} />
      )}
    </ExpandableSection>
  )
}

export function PlanSectionList({ sections, isEditMode }: PlanSectionListProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order)

  if (sorted.length === 0) {
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
    </div>
  )
}
