import { create } from 'zustand'
import type { TravelPlan, PlanSection, SectionType } from '@/types'
import type { PatchPlanSectionInput, NewSectionInput } from '@/api'
import { generateTempId, isTempId } from '@/lib/utils'
import { mapDomainFlightToApi, mapDomainAccommodationToApi, mapDomainActivityToApi } from '@/api/mappers'

interface PlanInfoChange {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

type ValidatorFn = () => string | null;

interface PendingChangesState {
  planInfo: PlanInfoChange | null;
  sections: Map<string, PatchPlanSectionInput>;
  validators: Map<string, ValidatorFn>;
  newSections: PlanSection[];
  deletedSectionIds: Set<string>;
}

interface PendingChangesActions {
  setPlanInfo: (info: PlanInfoChange) => void;
  setSectionChange: (sectionId: string, data: PatchPlanSectionInput) => void;
  registerValidator: (sectionId: string, fn: ValidatorFn) => void;
  unregisterValidator: (sectionId: string) => void;
  validateAll: () => string | null;
  hasChanges: () => boolean;
  addNewSection: (type: SectionType, title: string) => PlanSection;
  markSectionDeleted: (sectionId: string) => void;
  buildPayload: (currentPlan: TravelPlan) => {
    plan?: PlanInfoChange;
    sections?: PatchPlanSectionInput[];
    newSections?: NewSectionInput[];
    deletedSectionIds?: number[];
  };
  clear: () => void;
}

export const usePendingChangesStore = create<PendingChangesState & PendingChangesActions>()((set, get) => ({
  planInfo: null,
  sections: new Map(),
  validators: new Map(),
  newSections: [],
  deletedSectionIds: new Set<string>(),

  setPlanInfo: (info) => {
    set({ planInfo: info })
  },

  setSectionChange: (sectionId, data) => {
    set((state) => {
      const next = new Map(state.sections)
      next.set(sectionId, data)
      return { sections: next }
    })
  },

  registerValidator: (sectionId, fn) => {
    set((state) => {
      const next = new Map(state.validators)
      next.set(sectionId, fn)
      return { validators: next }
    })
  },

  unregisterValidator: (sectionId) => {
    set((state) => {
      const next = new Map(state.validators)
      next.delete(sectionId)
      return { validators: next }
    })
  },

  validateAll: () => {
    const { validators } = get()
    for (const [, validate] of validators) {
      const error = validate()
      if (error) return error
    }
    return null
  },

  hasChanges: () => {
    const { planInfo, sections, newSections, deletedSectionIds } = get()
    return planInfo !== null || sections.size > 0 || newSections.length > 0 || deletedSectionIds.size > 0
  },

  addNewSection: (type, title) => {
    const tempId = generateTempId()
    const { newSections } = get()
    const newSection: PlanSection = {
      id: tempId,
      type,
      title,
      order: Number.MAX_SAFE_INTEGER,
      confirmed: true,
      flightInfo: null,
      accommodationInfo: null,
      activityInfo: null,
    }
    set({ newSections: [...newSections, newSection] })
    return newSection
  },

  markSectionDeleted: (sectionId) => {
    if (isTempId(sectionId)) {
      // Remove from newSections (not yet on server)
      set((state) => {
        const nextSections = new Map(state.sections)
        nextSections.delete(sectionId)
        const nextValidators = new Map(state.validators)
        nextValidators.delete(sectionId)
        return {
          newSections: state.newSections.filter((s) => s.id !== sectionId),
          sections: nextSections,
          validators: nextValidators,
        }
      })
    } else {
      // Mark existing section for deletion on server
      set((state) => {
        const nextDeleted = new Set(state.deletedSectionIds)
        nextDeleted.add(sectionId)
        const nextSections = new Map(state.sections)
        nextSections.delete(sectionId)
        const nextValidators = new Map(state.validators)
        nextValidators.delete(sectionId)
        return {
          deletedSectionIds: nextDeleted,
          sections: nextSections,
          validators: nextValidators,
        }
      })
    }
  },

  buildPayload: (currentPlan) => {
    const { planInfo, sections, newSections, deletedSectionIds } = get()
    const payload: {
      plan?: PlanInfoChange;
      sections?: PatchPlanSectionInput[];
      newSections?: NewSectionInput[];
      deletedSectionIds?: number[];
    } = {}

    if (planInfo) {
      const changed: PlanInfoChange = {}
      if (planInfo.title !== undefined && planInfo.title !== currentPlan.title) changed.title = planInfo.title
      if (planInfo.description !== undefined && planInfo.description !== currentPlan.description) changed.description = planInfo.description
      if (planInfo.startDate !== undefined && planInfo.startDate !== currentPlan.startDate) changed.startDate = planInfo.startDate
      if (planInfo.endDate !== undefined && planInfo.endDate !== currentPlan.endDate) changed.endDate = planInfo.endDate
      if (Object.keys(changed).length > 0) {
        payload.plan = changed
      }
    }

    // Only include non-temp sections in sections payload
    if (sections.size > 0) {
      const existingSections = Array.from(sections.entries())
        .filter(([id]) => !isTempId(id))
        .map(([, data]) => data)
      if (existingSections.length > 0) {
        payload.sections = existingSections
      }
    }

    // Build newSections from temp sections
    if (newSections.length > 0) {
      payload.newSections = newSections.map((s) => {
        const input: NewSectionInput = {
          sectionType: s.type.toUpperCase() as 'FLIGHT' | 'ACCOMMODATION' | 'ACTIVITY',
          title: s.title,
          confirmed: s.confirmed,
        }
        // Merge form data from sections map if available
        const formData = sections.get(s.id)
        if (formData) {
          if (formData.title !== undefined) input.title = formData.title
          if (formData.confirmed !== undefined) input.confirmed = formData.confirmed
          if (formData.flightInfo) input.flightInfo = mapDomainFlightToApi(formData.flightInfo)
          if (formData.accommodationInfo) input.accommodationInfo = mapDomainAccommodationToApi(formData.accommodationInfo)
          if (formData.activityInfo) input.activityInfo = mapDomainActivityToApi(formData.activityInfo)
        }
        return input
      })
    }

    // Build deletedSectionIds
    if (deletedSectionIds.size > 0) {
      payload.deletedSectionIds = Array.from(deletedSectionIds).map(Number)
    }

    return payload
  },

  clear: () => {
    set({
      planInfo: null,
      sections: new Map(),
      validators: new Map(),
      newSections: [],
      deletedSectionIds: new Set<string>(),
    })
  },
}))
