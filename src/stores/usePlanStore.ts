import { create } from 'zustand'
import type { TravelPlan, SectionData } from '@/types'
import { planRepository } from '@/data'

interface PlanState {
  currentPlan: TravelPlan | null;
  isLoading: boolean;
  error: string | null;
}

interface PlanActions {
  loadPlanByAccessCode: (accessCode: string) => Promise<TravelPlan | null>;
  loadPlan: (planId: string) => Promise<TravelPlan | null>;
  updateSection: (sectionId: string, data: SectionData) => Promise<void>;
  clearPlan: () => void;
}

export const usePlanStore = create<PlanState & PlanActions>()((set, get) => ({
  currentPlan: null,
  isLoading: false,
  error: null,

  loadPlanByAccessCode: async (accessCode: string) => {
    set({ isLoading: true, error: null })
    const plan = await planRepository.getPlanByAccessCode(accessCode)
    if (plan) {
      set({ currentPlan: plan, isLoading: false })
    } else {
      set({ error: '존재하지 않는 입장번호입니다.', isLoading: false })
    }
    return plan
  },

  loadPlan: async (planId: string) => {
    set({ isLoading: true, error: null })
    const plan = await planRepository.getPlan(planId)
    if (plan) {
      set({ currentPlan: plan, isLoading: false })
    } else {
      set({ error: '존재하지 않는 플랜입니다.', isLoading: false })
    }
    return plan
  },

  updateSection: async (sectionId: string, data: SectionData) => {
    const { currentPlan } = get()
    if (!currentPlan) return

    await planRepository.updateSection(currentPlan.id, sectionId, data)

    set({
      currentPlan: {
        ...currentPlan,
        updatedAt: new Date().toISOString(),
        sections: currentPlan.sections.map((s) =>
          s.id === sectionId ? { ...s, data } : s,
        ),
      },
    })
  },

  clearPlan: () => {
    set({ currentPlan: null, error: null })
  },
}))
