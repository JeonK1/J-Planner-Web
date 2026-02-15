import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ExpandableSectionProps {
  title: string;
  defaultExpanded?: boolean;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
}

export function ExpandableSection({
  title,
  defaultExpanded = false,
  children,
  className,
  headerRight,
}: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className={cn('overflow-hidden rounded-xl border border-gray-200 bg-white', className)}>
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
      >
        <span className="text-base font-semibold text-gray-900">{title}</span>
        <div className="flex items-center gap-2">
          {headerRight && (
            <div onClick={(e) => e.stopPropagation()}>
              {headerRight}
            </div>
          )}
          <svg
            className={cn(
              'h-5 w-5 text-gray-500 transition-transform duration-200',
              isExpanded && 'rotate-180',
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200',
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-200 px-5 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
