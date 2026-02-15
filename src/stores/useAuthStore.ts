import { create } from 'zustand'
import { planRepository } from '@/data'

interface AuthState {
  authenticatedPlanIds: Set<string>;
}

interface AuthActions {
  authenticate: (planId: string, password: string) => Promise<boolean>;
  isAuthenticated: (planId: string) => boolean;
  exitEditMode: (planId: string) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()((set, get) => ({
  authenticatedPlanIds: new Set(),

  authenticate: async (planId: string, password: string) => {
    const isValid = await planRepository.verifyPassword(planId, password)
    if (isValid) {
      set((state) => ({
        authenticatedPlanIds: new Set(state.authenticatedPlanIds).add(planId),
      }))
    }
    return isValid
  },

  isAuthenticated: (planId: string) => {
    return get().authenticatedPlanIds.has(planId)
  },

  exitEditMode: (planId: string) => {
    set((state) => {
      const next = new Set(state.authenticatedPlanIds)
      next.delete(planId)
      return { authenticatedPlanIds: next }
    })
  },
}))
