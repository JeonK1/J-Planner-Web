import { useState, type FormEvent } from 'react'
import { Modal } from './Modal'
import { Input } from './Input'
import { Button } from './Button'

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    setError('')

    const isValid = await onSubmit(password)
    if (!isValid) {
      setError('비밀번호가 일치하지 않습니다.')
    }
    setIsSubmitting(false)
  }

  const handleClose = () => {
    setPassword('')
    setError('')
    onClose()
  }

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
          error={error}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? '확인 중...' : '확인'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
