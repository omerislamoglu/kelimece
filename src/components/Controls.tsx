import { useEffect } from 'react'

interface ControlsProps {
  letters: string[]
  onLetterClick: (letter: string) => void
  onDelete: () => void
  onShuffle: () => void
  onSubmit: () => void
}

export default function Controls({
  letters,
  onLetterClick,
  onDelete,
  onShuffle,
  onSubmit,
}: ControlsProps) {
  useEffect(() => {
    const letterSet = new Set(letters)

    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return

      if (e.key === 'Enter') {
        e.preventDefault()
        onSubmit()
        return
      }

      if (e.key === 'Backspace') {
        e.preventDefault()
        onDelete()
        return
      }

      if (e.key === ' ') {
        e.preventDefault()
        onShuffle()
        return
      }

      const key = e.key.toLowerCase()
      if (letterSet.has(key)) {
        e.preventDefault()
        onLetterClick(key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [letters, onLetterClick, onDelete, onShuffle, onSubmit])

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={onDelete}
        className="rounded-full border-2 border-gray-300 px-5 py-2.5 text-sm font-semibold
                   text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-800
                   active:bg-gray-100"
      >
        Sil
      </button>
      <button
        type="button"
        onClick={onShuffle}
        className="rounded-full border-2 border-gray-300 p-2.5 text-gray-500
                   transition-colors hover:border-gray-400 hover:text-gray-700
                   active:bg-gray-100"
        aria-label="Harfleri karıştır"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" />
          <path d="m18 2 4 4-4 4" />
          <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
          <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" />
          <path d="m18 14 4 4-4 4" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onSubmit}
        className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold
                   text-amber-950 transition-colors hover:bg-amber-300
                   active:bg-amber-500"
      >
        Gönder
      </button>
    </div>
  )
}
