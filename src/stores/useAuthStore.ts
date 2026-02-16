import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authenticatePlan } from '@/api'

interface AuthState {
  authenticatedPlanIds: Set<string>;
}

interface AuthActions {
  authenticate: (planId: string, password: string) => Promise<boolean>;
  isAuthenticated: (planId: string) => boolean;
  exitEditMode: (planId: string) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      authenticatedPlanIds: new Set(),

      authenticate: async (planId: string, password: string) => {
        const isValid = await authenticatePlan(planId, password)
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
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name)
          if (!str) return null
          const parsed = JSON.parse(str)
          if (parsed.state?.authenticatedPlanIds) {
            parsed.state.authenticatedPlanIds = new Set(parsed.state.authenticatedPlanIds)
          }
          return parsed
        },
        setItem: (name, value) => {
          const toStore = {
            ...value,
            state: {
              ...value.state,
              authenticatedPlanIds: [...value.state.authenticatedPlanIds],
            },
          }
          sessionStorage.setItem(name, JSON.stringify(toStore))
        },
        removeItem: (name) => sessionStorage.removeItem(name),
      },
    },
  ),
)
