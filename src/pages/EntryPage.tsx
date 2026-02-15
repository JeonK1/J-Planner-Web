import { Link } from 'react-router-dom'
import { AccessNumberForm } from '@/features/entry/components/AccessNumberForm'
import { Button } from '@/components/ui/Button'

export function EntryPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">J-Planner</h1>
          <p className="mt-2 text-sm text-gray-500">
            입장번호를 입력하여 여행 계획을 확인하세요
          </p>
        </div>
        <AccessNumberForm />
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">또는</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>
        <Link to="/create" className="mt-6 block">
          <Button variant="secondary" className="w-full">
            새 여행 계획 만들기
          </Button>
        </Link>
      </div>
    </div>
  )
}
