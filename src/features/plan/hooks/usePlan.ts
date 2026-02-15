import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlanStore } from '@/stores/usePlanStore'

export function usePlan() {
  const { planId } = useParams<{ planId: string }>()
  const navigate = useNavigate()
  const currentPlan = usePlanStore((s) => s.currentPlan)
  const isLoading = usePlanStore((s) => s.isLoading)
  const loadPlan = usePlanStore((s) => s.loadPlan)

  useEffect(() => {
    if (!planId) {
      navigate('/', { replace: true })
      return
    }

    if (!currentPlan || currentPlan.id !== planId) {
      loadPlan(planId).then((plan) => {
        if (!plan) {
          navigate('/not-found', { replace: true })
        }
      })
    }
  }, [planId, currentPlan, loadPlan, navigate])

  return {
    plan: currentPlan,
    isLoading,
    planId: planId ?? '',
  }
}
