import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlanStore } from '@/stores/usePlanStore'

export function useAccessNumber() {
  const [accessCode, setAccessCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const loadPlanByAccessCode = usePlanStore((s) => s.loadPlanByAccessCode)

  const submit = async () => {
    const trimmed = accessCode.trim()
    if (!trimmed) {
      setError('입장번호를 입력해주세요.')
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
        setError(storeError ?? '존재하지 않는 입장번호입니다.')
      }
    } catch {
      setError('서버와 통신할 수 없습니다. 잠시 후 다시 시도해주세요.')
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
