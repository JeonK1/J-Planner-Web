import { useState, useCallback, useEffect, useRef } from 'react'
import type { PlanSection } from '@/types'
import type { PatchPlanSectionInput } from '@/api'
import { MESSAGES } from '@/constants'
import { usePendingChangesStore } from '@/stores/usePendingChangesStore'

interface UseSectionFormReturn<T> {
  title: string;
  setTitle: (title: string) => void;
  data: T;
  update: (partial: Partial<T>) => void;
  validationError: string | null;
}

export function useSectionForm<T>(
  section: PlanSection,
  initialData: T,
  sectionId: string,
  toInput: (title: string, data: T) => Omit<PatchPlanSectionInput, 'id'>,
  validate: (title: string, data: T) => string | null,
): UseSectionFormReturn<T> {
  const [title, setTitle] = useState(section.title)
  const [data, setData] = useState<T>(initialData)
  const [validationError, setValidationError] = useState<string | null>(null)

  const setSectionChange = usePendingChangesStore((s) => s.setSectionChange)
  const registerValidator = usePendingChangesStore((s) => s.registerValidator)
  const unregisterValidator = usePendingChangesStore((s) => s.unregisterValidator)

  const update = useCallback((partial: Partial<T>) => {
    setData((prev) => ({ ...prev, ...partial }))
  }, [])

  // Sync changes to pending store
  const titleRef = useRef(title)
  const dataRef = useRef(data)
  titleRef.current = title
  dataRef.current = data

  useEffect(() => {
    const input = toInput(title, data)
    setSectionChange(sectionId, { id: sectionId, ...input })
  }, [title, data, sectionId, toInput, setSectionChange])

  // Register validator
  useEffect(() => {
    registerValidator(sectionId, () => {
      const t = titleRef.current
      const d = dataRef.current
      if (t.trim().length > 200) {
        return MESSAGES.validation.sectionTitleMaxLength
      }
      const error = validate(t, d)
      if (error) {
        setValidationError(error)
        return error
      }
      setValidationError(null)
      return null
    })
    return () => unregisterValidator(sectionId)
  }, [sectionId, validate, registerValidator, unregisterValidator])

  return {
    title,
    setTitle,
    data,
    update,
    validationError,
  }
}
