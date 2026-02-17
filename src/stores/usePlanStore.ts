import { create } from 'zustand'
import type { TravelPlan } from '@/types'
import { MESSAGES } from '@/constants'
import {
  fetchPlan,
  createPlan as apiCreatePlan,
  reorderSections as apiReorderSections,
} from '@/api'
import type { CreatePlanInput } from '@/api'

interface PlanState {
  currentPlan: TravelPlan | null;
  isLoading: boolean;
  error: string | null;
}

interface PlanActions {
  loadPlan: (accessCode: string) => Promise<TravelPlan | null>;
  createPlan: (input: CreatePlanInput) => Promise<TravelPlan>;
  reorderSections: (sectionIds: string[]) => Promise<void>;
  applyPatchResult: (plan: TravelPlan) => void;
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

  applyPatchResult: (plan: TravelPlan) => {
    set({ currentPlan: plan })
  },

  clearPlan: () => {
    set({ currentPlan: null, error: null })
  },
}))
