import type { FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAccessNumber } from '../hooks/useAccessNumber'

export function AccessNumberForm() {
  const { accessCode, setAccessCode, error, isLoading, submit } = useAccessNumber()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="accessCode"
        label="입장번호"
        placeholder="입장번호를 입력하세요"
        value={accessCode}
        onChange={(e) => setAccessCode(e.target.value)}
        error={error}
        autoFocus
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? '확인 중...' : '입장'}
      </Button>
    </form>
  )
}
