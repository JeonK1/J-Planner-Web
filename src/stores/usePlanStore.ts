import { create } from 'zustand'
import type { TravelPlan, SectionType } from '@/types'
import { MESSAGES } from '@/constants'
import {
  fetchPlan,
  createPlan as apiCreatePlan,
  updatePlan,
  addSection as apiAddSection,
  updateSection as apiUpdateSection,
  reorderSections as apiReorderSections,
  deleteSection as apiDeleteSection,
} from '@/api'
import type { CreatePlanInput, UpdateSectionInput } from '@/api'

interface PlanState {
  currentPlan: TravelPlan | null;
  isLoading: boolean;
  error: string | null;
}

interface PlanActions {
  loadPlan: (accessCode: string) => Promise<TravelPlan | null>;
  createPlan: (input: CreatePlanInput) => Promise<TravelPlan>;
  updatePlanInfo: (updates: Partial<Pick<TravelPlan, 'title' | 'description' | 'startDate' | 'endDate'>>) => Promise<void>;
  addSection: (type: SectionType, title: string) => Promise<void>;
  updateSection: (sectionId: string, input: UpdateSectionInput) => Promise<void>;
  reorderSections: (sectionIds: string[]) => Promise<void>;
  removeSection: (sectionId: string) => Promise<void>;
  clearPlan: () => void;
}

export const usePlanStore = create<PlanState & PlanActions>()((set, get) => ({
  currentPlan: null,
  isLoading: false,
  error: null,

  loadPlan: async (accessCode: string) => {
    set({ isLoading: true, error: null })
    try {
      const plan = await fetchPlan(accessCode)
      if (plan) {
        set({ currentPlan: plan, isLoading: false })
      } else {
        set({ error: MESSAGES.error.planNotFound, isLoading: false })
      }
      return plan
    } catch {
      set({ error: MESSAGES.error.network, isLoading: false })
      return null
    }
  },

  createPlan: async (input: CreatePlanInput) => {
    const plan = await apiCreatePlan(input)
    set({ currentPlan: plan })
    return plan
  },

  updatePlanInfo: async (updates) => {
    const { currentPlan } = get()
    if (!currentPlan) return

    const updatedPlan = await updatePlan(currentPlan.accessCode, {
      title: updates.title ?? currentPlan.title,
      description: updates.description ?? currentPlan.description,
      startDate: updates.startDate ?? currentPlan.startDate,
      endDate: updates.endDate ?? currentPlan.endDate,
    })
    set({ currentPlan: updatedPlan })
  },

  addSection: async (type: SectionType, title: string) => {
    const { currentPlan } = get()
    if (!currentPlan) return

    const newSection = await apiAddSection(currentPlan.accessCode, title, type)
    set((state) => {
      if (!state.currentPlan) return state
      return {
        currentPlan: {
          ...state.currentPlan,
          sections: [...state.currentPlan.sections, newSection],
        },
      }
    })
  },

  updateSection: async (sectionId: string, input: UpdateSectionInput) => {
    const { currentPlan } = get()
    if (!currentPlan) return

    const updatedSection = await apiUpdateSection(currentPlan.accessCode, sectionId, input)
    set((state) => {
      if (!state.currentPlan) return state
      return {
        currentPlan: {
          ...state.currentPlan,
          sections: state.currentPlan.sections.map((s) =>
            s.id === sectionId ? updatedSection : s,
          ),
        },
      }
    })
  },

  reorderSections: async (sectionIds: string[]) => {
    const { currentPlan } = get()
    if (!currentPlan) return

    const numericIds = sectionIds.map(Number)
    const updatedSections = await apiReorderSections(currentPlan.accessCode, numericIds)
    set((state) => {
      if (!state.currentPlan) return state
      return {
        currentPlan: {
          ...state.currentPlan,
          sections: updatedSections,
        },
      }
    })
  },

  removeSection: async (sectionId: string) => {
    const { currentPlan } = get()
    if (!currentPlan) return

    await apiDeleteSection(currentPlan.accessCode, sectionId)
    set((state) => {
      if (!state.currentPlan) return state
      return {
        currentPlan: {
          ...state.currentPlan,
          sections: state.currentPlan.sections.filter((s) => s.id !== sectionId),
        },
      }
    })
  },

  clearPlan: () => {
    set({ currentPlan: null, error: null })
  },
}))
