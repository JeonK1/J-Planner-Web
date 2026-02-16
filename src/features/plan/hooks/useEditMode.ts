import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { AUTH_EVENT_KEY } from '@/api/client'

export function useEditMode(planId: string) {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const authenticatedPlanIds = useAuthStore((s) => s.authenticatedPlanIds)
  const authenticate = useAuthStore((s) => s.authenticate)
  const exitEditMode = useAuthStore((s) => s.exitEditMode)

  const isEditMode = authenticatedPlanIds.has(planId)

  useEffect(() => {
    const handler = (event: Event) => {
      if (!(event instanceof CustomEvent) || event.detail !== AUTH_EVENT_KEY) return
      if (authenticatedPlanIds.has(planId)) {
        exitEditMode(planId)
        setIsPasswordDialogOpen(true)
      }
    }
    window.addEventListener('auth:session-expired', handler)
    return () => window.removeEventListener('auth:session-expired', handler)
  }, [planId, authenticatedPlanIds, exitEditMode])

  const requestEdit = () => {
    setIsPasswordDialogOpen(true)
  }

  const handlePasswordSubmit = async (password: string): Promise<boolean> => {
    const isValid = await authenticate(planId, password)
    if (isValid) {
      setIsPasswordDialogOpen(false)
    }
    return isValid
  }

  const handleExitEdit = () => {
    exitEditMode(planId)
  }

  const closePasswordDialog = () => {
    setIsPasswordDialogOpen(false)
  }

  return {
    isEditMode,
    isPasswordDialogOpen,
    requestEdit,
    handlePasswordSubmit,
    handleExitEdit,
    closePasswordDialog,
  }
}
