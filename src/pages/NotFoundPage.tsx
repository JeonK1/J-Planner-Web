import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="mt-4 text-lg text-gray-600">페이지를 찾을 수 없습니다</p>
        <p className="mt-2 text-sm text-gray-500">
          요청하신 여행 계획이 존재하지 않거나 삭제되었습니다.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button>홈으로 돌아가기</Button>
        </Link>
      </div>
    </div>
  )
}
