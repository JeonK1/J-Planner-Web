import { useState } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'

export function useEditMode(planId: string) {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const authenticatedPlanIds = useAuthStore((s) => s.authenticatedPlanIds)
  const authenticate = useAuthStore((s) => s.authenticate)
  const exitEditMode = useAuthStore((s) => s.exitEditMode)

  const isEditMode = authenticatedPlanIds.has(planId)

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
