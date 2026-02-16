import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { usePlanStore } from '@/stores/usePlanStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { CONSTRAINTS, MESSAGES } from '@/constants'

export function CreatePlanPage() {
  const navigate = useNavigate()
  const createPlan = usePlanStore((s) => s.createPlan)
  const authenticate = useAuthStore((s) => s.authenticate)

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!password) {
      newErrors.password = MESSAGES.validation.requiredPassword
    } else if (password.length < CONSTRAINTS.plan.passwordMinLength) {
      newErrors.password = MESSAGES.validation.passwordMinLength
    }
    if (password !== passwordConfirm) {
      newErrors.passwordConfirm = MESSAGES.validation.passwordMismatch
    }
    if (!title.trim()) {
      newErrors.title = MESSAGES.validation.requiredTitle
    } else if (title.trim().length > CONSTRAINTS.plan.titleMaxLength) {
      newErrors.title = MESSAGES.validation.titleMaxLength
    }
    if (!startDate) {
      newErrors.startDate = MESSAGES.validation.requiredStartDate
    }
    if (!endDate) {
      newErrors.endDate = MESSAGES.validation.requiredEndDate
    }
    if (startDate && endDate && startDate > endDate) {
      newErrors.endDate = MESSAGES.validation.endDateBeforeStart
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!validate()) {
      setIsSubmitting(false)
      return
    }

    try {
      const plan = await createPlan({
        password,
        title: title.trim(),
        description: description.trim(),
        startDate,
        endDate,
      })

      await authenticate(plan.accessCode, password)
      navigate(`/plan/${plan.accessCode}`, { replace: true })
    } catch {
      setErrors({ form: MESSAGES.error.serverError })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">새 여행 계획 만들기</h1>
          <p className="mt-2 text-sm text-gray-500">
            여행 계획의 기본 정보를 입력해주세요
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errors.form && (
            <p className="text-center text-sm text-red-500">{errors.form}</p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="password"
              type="password"
              label="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="수정 시 필요한 비밀번호"
              error={errors.password}
              maxLength={CONSTRAINTS.plan.passwordMaxLength}
              autoFocus
            />
            <Input
              id="passwordConfirm"
              type="password"
              label="비밀번호 확인"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호를 다시 입력"
              error={errors.passwordConfirm}
              maxLength={CONSTRAINTS.plan.passwordMaxLength}
            />
          </div>
          <hr className="border-gray-200" />
          <Input
            id="title"
            label="여행 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="일본 도쿄 여행 2026"
            error={errors.title}
            maxLength={CONSTRAINTS.plan.titleMaxLength}
          />
          <Input
            id="description"
            label="설명"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="간략한 여행 설명 (선택)"
            maxLength={CONSTRAINTS.plan.descriptionMaxLength}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="startDate"
              type="date"
              label="시작일"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              error={errors.startDate}
            />
            <Input
              id="endDate"
              type="date"
              label="종료일"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              error={errors.endDate}
            />
          </div>
          <div className="mt-2 flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => navigate('/')}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? '생성 중...' : '생성하기'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
