import { create } from 'zustand'
import type { TravelPlan, SectionData } from '@/types'
import { planRepository } from '@/data'
import { generateId } from '@/lib/utils'

interface CreatePlanInput {
  accessCode: string;
  password: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

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

  createPlan: async (input: CreatePlanInput) => {
    const now = new Date().toISOString()
    const plan: TravelPlan = {
      id: generateId(),
      accessCode: input.accessCode,
      password: input.password,
      title: input.title,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate,
      sections: [
        {
          id: generateId(),
          type: 'flight',
          title: '비행기정보',
          order: 0,
          data: { type: 'flight', flights: [] },
        },
        {
          id: generateId(),
          type: 'accommodation',
          title: '숙소정보',
          order: 1,
          data: { type: 'accommodation', accommodations: [] },
        },
      ],
      createdAt: now,
      updatedAt: now,
    }
    await planRepository.savePlan(plan)
    set({ currentPlan: plan })
    return plan
  },

  updatePlanInfo: async (updates) => {
    const { currentPlan } = get()
    if (!currentPlan) return

    const updatedPlan = {
      ...currentPlan,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    await planRepository.savePlan(updatedPlan)
    set({ currentPlan: updatedPlan })
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
