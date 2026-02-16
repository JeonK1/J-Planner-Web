import { create } from 'zustand'
import { authenticatePlan } from '@/api'

interface AuthState {
  tokens: Map<string, string>;
}

interface AuthActions {
  authenticate: (accessCode: string, password: string) => Promise<boolean>;
  isAuthenticated: (accessCode: string) => boolean;
  exitEditMode: (accessCode: string) => void;
  getToken: (accessCode: string) => string | undefined;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  (set, get) => ({
    tokens: new Map(),

    authenticate: async (accessCode: string, password: string) => {
      const token = await authenticatePlan(accessCode, password)
      if (token) {
        set((state) => {
          const next = new Map(state.tokens)
          next.set(accessCode, token)
          return { tokens: next }
        })
        return true
      }
      return false
    },

    isAuthenticated: (accessCode: string) => {
      return get().tokens.has(accessCode)
    },

    exitEditMode: (accessCode: string) => {
      set((state) => {
        const next = new Map(state.tokens)
        next.delete(accessCode)
        return { tokens: next }
      })
    },

    getToken: (accessCode: string) => {
      return get().tokens.get(accessCode)
    },
  }),
)
