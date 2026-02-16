import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { AUTH_EVENT_KEY } from '@/api/client'

export function useEditMode(accessCode: string) {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const tokens = useAuthStore((s) => s.tokens)
  const authenticate = useAuthStore((s) => s.authenticate)
  const exitEditMode = useAuthStore((s) => s.exitEditMode)

  const isEditMode = tokens.has(accessCode)

  useEffect(() => {
    const handler = (event: Event) => {
      if (!(event instanceof CustomEvent) || event.detail !== AUTH_EVENT_KEY) return
      if (tokens.has(accessCode)) {
        exitEditMode(accessCode)
        setIsPasswordDialogOpen(true)
      }
    }
    window.addEventListener('auth:session-expired', handler)
    return () => window.removeEventListener('auth:session-expired', handler)
  }, [accessCode, tokens, exitEditMode])

  const requestEdit = () => {
    setIsPasswordDialogOpen(true)
  }

  const handlePasswordSubmit = async (password: string): Promise<boolean> => {
    const isValid = await authenticate(accessCode, password)
    if (isValid) {
      setIsPasswordDialogOpen(false)
    }
    return isValid
  }

  const handleExitEdit = () => {
    exitEditMode(accessCode)
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
