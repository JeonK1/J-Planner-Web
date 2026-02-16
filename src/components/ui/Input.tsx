import { useId, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className,
  id: externalId,
  ...props
}: InputProps) {
  const generatedId = useId()
  const id = externalId ?? generatedId
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'rounded-lg border border-gray-300 px-3 py-2 text-sm',
          'outline-none transition-colors',
          'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          'placeholder:text-gray-400',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          className,
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
