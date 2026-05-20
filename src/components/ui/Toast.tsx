import { useEffect, useState } from 'react'
import type { MessageType } from '../../hooks/useGame'

interface ToastMessage {
  text: string
  type: MessageType
  reportable?: boolean
}

interface ToastProps {
  message: ToastMessage | null
  onReport?: () => void
}

export default function Toast({ message, onReport }: ToastProps) {
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState(message)
  const [prevMessage, setPrevMessage] = useState(message)

  // Adjust state during render when prop changes (React-recommended pattern)
  if (message !== prevMessage) {
    setPrevMessage(message)
    if (message) {
      setCurrent(message)
      setVisible(true)
    }
  }

  // Auto-hide after delay
  useEffect(() => {
    if (!visible) return
    const delay = current?.reportable ? 4000 : 1700
    const timer = setTimeout(() => setVisible(false), delay)
    return () => clearTimeout(timer)
  }, [visible, current?.reportable])

  if (!current) return null

  const isTamKelime =
    current.type === 'success' && current.text.startsWith('Tam Kelime')

  const bgClass = isTamKelime
    ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-primary-600/40 ring-2 ring-accent-500/20'
    : current.type === 'success'
      ? 'bg-success-500 text-white'
      : current.type === 'error'
        ? 'bg-error-500 text-white'
        : current.type === 'warning'
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200'
          : 'bg-surface-800 text-surface-100 dark:bg-surface-200 dark:text-surface-900'

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed left-1/2 z-[60] -translate-x-1/2
        top-[calc(0.75rem+var(--safe-area-top))]
        transition-all duration-300 ease-out ${
          visible
            ? 'translate-y-0 scale-100 opacity-100'
            : '-translate-y-3 scale-95 opacity-0'
        }`}
    >
      <div
        className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-center text-sm font-bold shadow-lg ${bgClass}`}
      >
        <span>{current.text}</span>
        {current.reportable && onReport && visible && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onReport()
              setVisible(false)
            }}
            aria-label="Kelimeyi bildir"
            className="pointer-events-auto rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-white/30"
          >
            Bildir
          </button>
        )}
      </div>
    </div>
  )
}
