import { useState, useCallback } from 'react'
import type { PlanSection } from '@/types'
import type { UpdateSectionInput } from '@/api'
import { MESSAGES } from '@/constants'

interface UseSectionFormReturn<T> {
  title: string;
  setTitle: (title: string) => void;
  data: T;
  update: (partial: Partial<T>) => void;
  isSaving: boolean;
  validationError: string | null;
  save: (
    validate: () => string | null,
    toInput: () => UpdateSectionInput,
  ) => Promise<void>;
}

export function useSectionForm<T>(
  section: PlanSection,
  initialData: T,
  onSave: (input: UpdateSectionInput) => Promise<void>,
): UseSectionFormReturn<T> {
  const [title, setTitle] = useState(section.title)
  const [data, setData] = useState<T>(initialData)
  const [isSaving, setIsSaving] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const update = useCallback((partial: Partial<T>) => {
    setData((prev) => ({ ...prev, ...partial }))
  }, [])

  const save = useCallback(async (
    validate: () => string | null,
    toInput: () => UpdateSectionInput,
  ) => {
    setValidationError(null)
    if (title.trim().length > 200) {
      setValidationError(MESSAGES.validation.sectionTitleMaxLength)
      return
    }
    const error = validate()
    if (error) {
      setValidationError(error)
      return
    }
    setIsSaving(true)
    await onSave(toInput())
    setIsSaving(false)
  }, [title, onSave])

  return {
    title,
    setTitle,
    data,
    update,
    isSaving,
    validationError,
    save,
  }
}
