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
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={onDelete}
        className="rounded-full border-2 border-cream-300 bg-white px-6 py-3 text-sm
                   font-semibold text-bark-600 transition-all duration-150
                   hover:border-honey-400 hover:text-bark-800 active:scale-95"
      >
        Sil
      </button>
      <button
        type="button"
        onClick={onShuffle}
        className="rounded-full border-2 border-cream-300 bg-white p-3 text-bark-600
                   transition-all duration-150 hover:border-honey-400
                   hover:text-bark-800 active:rotate-180 active:scale-95"
        aria-label="Harfleri karıştır"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
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
        className="rounded-full bg-honey-400 px-6 py-3 text-sm font-bold
                   text-bark-800 shadow-md shadow-honey-400/30
                   transition-all duration-150 hover:bg-honey-300
                   hover:shadow-lg hover:shadow-honey-400/40 active:scale-95"
      >
        Gönder
      </button>
    </div>
  )
}
