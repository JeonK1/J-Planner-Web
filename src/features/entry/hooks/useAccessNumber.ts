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

    const plan = await loadPlanByAccessCode(trimmed)
    if (plan) {
      navigate(`/plan/${plan.id}`)
    } else {
      setError('존재하지 않는 입장번호입니다.')
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
