import { create } from 'zustand'
import type { TravelPlan, SectionType } from '@/types'
import {
  fetchPlanByAccessCode,
  fetchPlan,
  createPlan as apiCreatePlan,
  updatePlan,
  addSection as apiAddSection,
  updateSection as apiUpdateSection,
  deleteSection as apiDeleteSection,
} from '@/api'
import type { CreatePlanInput, UpdateSectionInput } from '@/api'

interface PlanState {
  currentPlan: TravelPlan | null;
  isLoading: boolean;
  error: string | null;
}

interface PlanActions {
  loadPlanByAccessCode: (accessCode: string) => Promise<TravelPlan | null>;
  loadPlan: (planId: string) => Promise<TravelPlan | null>;
  createPlan: (input: CreatePlanInput) => Promise<TravelPlan>;
  updatePlanInfo: (updates: Partial<Pick<TravelPlan, 'title' | 'description' | 'startDate' | 'endDate'>>) => Promise<void>;
  addSection: (type: SectionType, title: string) => Promise<void>;
  updateSection: (sectionId: string, input: UpdateSectionInput) => Promise<void>;
  removeSection: (sectionId: string) => Promise<void>;
  clearPlan: () => void;
}

export const usePlanStore = create<PlanState & PlanActions>()((set, get) => ({
  currentPlan: null,
  isLoading: false,
  error: null,

  loadPlanByAccessCode: async (accessCode: string) => {
    set({ isLoading: true, error: null })
    try {
      const plan = await fetchPlanByAccessCode(accessCode)
      if (plan) {
        set({ currentPlan: plan, isLoading: false })
      } else {
        set({ error: '존재하지 않는 입장번호입니다.', isLoading: false })
      }
      return plan
    } catch {
      set({ error: '서버와 통신 중 오류가 발생했습니다.', isLoading: false })
      return null
    }
  },

  loadPlan: async (planId: string) => {
    set({ isLoading: true, error: null })
    try {
      const plan = await fetchPlan(planId)
      if (plan) {
        set({ currentPlan: plan, isLoading: false })
      } else {
        set({ error: '존재하지 않는 플랜입니다.', isLoading: false })
      }
      return plan
    } catch {
      set({ error: '서버와 통신 중 오류가 발생했습니다.', isLoading: false })
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

    const updatedPlan = await updatePlan(currentPlan.id, {
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

    const newSection = await apiAddSection(currentPlan.id, title, type)
    set({
      currentPlan: {
        ...currentPlan,
        sections: [...currentPlan.sections, newSection],
      },
    })
  },

  updateSection: async (sectionId: string, input: UpdateSectionInput) => {
    const { currentPlan } = get()
    if (!currentPlan) return

    const updatedSection = await apiUpdateSection(currentPlan.id, sectionId, input)
    set({
      currentPlan: {
        ...currentPlan,
        sections: currentPlan.sections.map((s) =>
          s.id === sectionId ? updatedSection : s,
        ),
      },
    })
  },

  removeSection: async (sectionId: string) => {
    const { currentPlan } = get()
    if (!currentPlan) return

    await apiDeleteSection(currentPlan.id, sectionId)
    set({
      currentPlan: {
        ...currentPlan,
        sections: currentPlan.sections.filter((s) => s.id !== sectionId),
      },
    })
  },

  clearPlan: () => {
    set({ currentPlan: null, error: null })
  },
}))
