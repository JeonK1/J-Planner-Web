import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react'
import { Modal } from './Modal'
import { Input } from './Input'
import { Button } from './Button'
import { ApiError } from '@/api'
import { CONSTRAINTS, MESSAGES } from '@/constants'

interface PasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<boolean>;
}

export function PasswordDialog({
  isOpen,
  onClose,
  onSubmit,
}: PasswordDialogProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    return clearTimer
  }, [clearTimer])

  const startCountdown = useCallback((seconds: number) => {
    clearTimer()
    setCountdown(seconds)
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearTimer()
          setError('')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [clearTimer])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError(MESSAGES.validation.requiredPassword)
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const isValid = await onSubmit(password)
      if (!isValid) {
        setError(MESSAGES.validation.passwordMismatch)
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        const seconds = err.retryAfter ?? 60
        setError(`${MESSAGES.error.tooManyRequests} (${seconds}초)`)
        startCountdown(seconds)
      } else {
        setError(MESSAGES.error.unknown)
      }
    }
    setIsSubmitting(false)
  }

  const handleClose = () => {
    setPassword('')
    setError('')
    setCountdown(0)
    clearTimer()
    onClose()
  }

  const isDisabled = isSubmitting || countdown > 0

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="수정 권한 인증">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="password"
          type="password"
          label="비밀번호"
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={countdown > 0 ? `${MESSAGES.error.tooManyRequests} (${countdown}초)` : error}
          maxLength={CONSTRAINTS.plan.passwordMaxLength}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={isDisabled}
          >
            {isSubmitting ? '확인 중...' : countdown > 0 ? `${countdown}초 후 재시도` : '확인'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
