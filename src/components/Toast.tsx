import { useEffect, useState } from 'react'

interface ToastProps {
  message: { text: string; type: 'success' | 'error' | 'info' } | null
}

export default function Toast({ message }: ToastProps) {
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState(message)

  useEffect(() => {
    if (message) {
      setCurrent(message)
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), 1700)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [message])

  if (!current) return null

  const isPangram =
    current.type === 'success' && current.text.startsWith('Pangram')

  return (
    <div
      className={`pointer-events-none fixed left-1/2 top-12 z-[60] -translate-x-1/2
        transition-all duration-300 ease-out ${
          visible
            ? 'translate-y-0 scale-100 opacity-100'
            : '-translate-y-3 scale-95 opacity-0'
        }`}
    >
      <div
        className={`rounded-2xl px-5 py-2.5 text-center text-sm font-bold shadow-lg ${
          isPangram
            ? 'bg-gradient-to-r from-honey-400 to-honey-300 text-bark-800 shadow-honey-400/40 ring-2 ring-honey-500/20'
            : current.type === 'success'
              ? 'bg-bark-800 text-cream-100'
              : current.type === 'error'
                ? 'bg-bark-900 text-cream-200'
                : 'bg-bark-700 text-cream-200'
        }`}
      >
        {current.text}
      </div>
    </div>
  )
}
