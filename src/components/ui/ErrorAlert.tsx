import { useEffect, useState } from 'react'

interface ErrorAlertProps {
  message: string | null;
  onDismiss?: () => void;
  autoHideMs?: number;
}

export function ErrorAlert({ message, onDismiss, autoHideMs }: ErrorAlertProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (message) {
      setVisible(true)
      if (autoHideMs && autoHideMs > 0) {
        const timer = setTimeout(() => {
          setVisible(false)
          onDismiss?.()
        }, autoHideMs)
        return () => clearTimeout(timer)
      }
    } else {
      setVisible(false)
    }
  }, [message, autoHideMs, onDismiss])

  if (!visible || !message) return null

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <div className="flex items-start justify-between gap-2">
        <span>{message}</span>
        {onDismiss && (
          <button
            type="button"
            onClick={() => { setVisible(false); onDismiss() }}
            className="shrink-0 text-red-400 hover:text-red-600"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  )
}
