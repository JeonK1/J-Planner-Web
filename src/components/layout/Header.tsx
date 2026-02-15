import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-4xl items-center px-4">
        <Link to="/" className="text-lg font-bold text-gray-900">
          J-Planner
        </Link>
      </div>
    </header>
  )
}
