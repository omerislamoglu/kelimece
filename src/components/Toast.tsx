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
      className={`pointer-events-none fixed left-1/2 top-16 z-50 -translate-x-1/2
        transition-all duration-300 ${
          visible
            ? 'translate-y-0 opacity-100'
            : '-translate-y-4 opacity-0'
        }`}
    >
      <div
        className={`rounded-xl px-5 py-3 text-center text-sm font-semibold shadow-lg ${
          isPangram
            ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 ring-2 ring-amber-500/30'
            : current.type === 'success'
              ? 'bg-green-500 text-white'
              : current.type === 'error'
                ? 'bg-gray-800 text-white'
                : 'bg-blue-500 text-white'
        }`}
      >
        {isPangram && <span className="mr-1">*</span>}
        {current.text}
      </div>
    </div>
  )
}
