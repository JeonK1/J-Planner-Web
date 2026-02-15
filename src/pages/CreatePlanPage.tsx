import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { usePlanStore } from '@/stores/usePlanStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { checkAccessCodeExists, ApiError } from '@/api'

export function CreatePlanPage() {
  const navigate = useNavigate()
  const createPlan = usePlanStore((s) => s.createPlan)
  const authenticate = useAuthStore((s) => s.authenticate)

  const [accessCode, setAccessCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {}

    if (!accessCode.trim()) {
      newErrors.accessCode = '입장번호를 입력해주세요.'
    } else {
      try {
        const exists = await checkAccessCodeExists(accessCode.trim())
        if (exists) {
          newErrors.accessCode = '이미 사용 중인 입장번호입니다.'
        }
      } catch {
        newErrors.accessCode = '입장번호 확인에 실패했습니다.'
      }
    }

    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요.'
    }
    if (password !== passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.'
    }
    if (!title.trim()) {
      newErrors.title = '여행 제목을 입력해주세요.'
    }
    if (!startDate) {
      newErrors.startDate = '시작일을 선택해주세요.'
    }
    if (!endDate) {
      newErrors.endDate = '종료일을 선택해주세요.'
    }
    if (startDate && endDate && startDate > endDate) {
      newErrors.endDate = '종료일은 시작일 이후여야 합니다.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const isValid = await validate()
    if (!isValid) {
      setIsSubmitting(false)
      return
    }

    try {
      const plan = await createPlan({
        accessCode: accessCode.trim(),
        password,
        title: title.trim(),
        description: description.trim(),
        startDate,
        endDate,
      })

      await authenticate(plan.id, password)
      navigate(`/plan/${plan.id}`, { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.code === 'DUPLICATE_ACCESS_CODE') {
        setErrors({ accessCode: '이미 사용 중인 입장번호입니다.' })
      } else {
        setErrors({ accessCode: '서버 오류가 발생했습니다. 다시 시도해주세요.' })
      }
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="accessCode"
              label="입장번호"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="다른 사람이 입장할 코드"
              error={errors.accessCode}
              autoFocus
            />
            <div />
            <Input
              id="password"
              type="password"
              label="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="수정 시 필요한 비밀번호"
              error={errors.password}
            />
            <Input
              id="passwordConfirm"
              type="password"
              label="비밀번호 확인"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호를 다시 입력"
              error={errors.passwordConfirm}
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
          />
          <Input
            id="description"
            label="설명"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="간략한 여행 설명 (선택)"
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
