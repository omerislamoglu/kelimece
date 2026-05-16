import { useEffect, useState } from 'react'

interface ToastProps {
  message: { text: string; type: 'success' | 'error' | 'info' } | null
}

export default function Toast({ message }: ToastProps) {
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
    const timer = setTimeout(() => setVisible(false), 1700)
    return () => clearTimeout(timer)
  }, [visible])

  if (!current) return null

  const isTamKelime =
    current.type === 'success' && current.text.startsWith('Tam Kelime')

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
        className={`rounded-2xl px-5 py-2.5 text-center text-sm font-bold shadow-lg ${
          isTamKelime
            ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-primary-600/40 ring-2 ring-accent-500/20'
            : current.type === 'success'
              ? 'bg-success-500 text-white'
              : current.type === 'error'
                ? 'bg-error-500 text-white'
                : 'bg-surface-800 text-surface-100 dark:bg-surface-200 dark:text-surface-900'
        }`}
      >
        {current.text}
      </div>
    </div>
  )
}
