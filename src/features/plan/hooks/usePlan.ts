import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlanStore } from '@/stores/usePlanStore'

export function usePlan() {
  const { accessCode } = useParams<{ accessCode: string }>()
  const navigate = useNavigate()
  const currentPlan = usePlanStore((s) => s.currentPlan)
  const isLoading = usePlanStore((s) => s.isLoading)
  const error = usePlanStore((s) => s.error)
  const loadPlan = usePlanStore((s) => s.loadPlan)

  useEffect(() => {
    if (!accessCode) {
      navigate('/', { replace: true })
      return
    }

    if (!currentPlan || currentPlan.accessCode !== accessCode) {
      loadPlan(accessCode).then((plan) => {
        if (!plan && !usePlanStore.getState().error) {
          navigate('/not-found', { replace: true })
        }
      })
    }
  }, [accessCode, currentPlan, loadPlan, navigate])

  return {
    plan: currentPlan,
    isLoading,
    error,
    accessCode: accessCode ?? '',
  }
}
