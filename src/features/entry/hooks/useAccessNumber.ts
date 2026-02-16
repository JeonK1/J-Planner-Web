import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlanStore } from '@/stores/usePlanStore'
import { MESSAGES } from '@/constants'

export function useAccessNumber() {
  const [accessCode, setAccessCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const loadPlanByAccessCode = usePlanStore((s) => s.loadPlanByAccessCode)

  const submit = async () => {
    const trimmed = accessCode.trim()
    if (!trimmed) {
      setError(MESSAGES.validation.requiredAccessCode)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const plan = await loadPlanByAccessCode(trimmed)
      if (plan) {
        navigate(`/plan/${plan.id}`)
      } else {
        const storeError = usePlanStore.getState().error
        setError(storeError ?? MESSAGES.error.accessCodeNotFound)
      }
    } catch {
      setError(MESSAGES.error.networkRetry)
    }
    setIsLoading(false)
  }

  return {
    accessCode,
    setAccessCode,
    error,
    isLoading,
    submit,
  }
}
