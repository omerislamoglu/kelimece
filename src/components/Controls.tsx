import { useEffect } from 'react'
import { Delete, Shuffle, Send } from 'lucide-react'

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
        className="flex items-center gap-2 rounded-full border-2 border-surface-200 bg-white px-5 py-3 text-sm
                   font-semibold text-surface-700 transition-all duration-150
                   hover:border-primary-500 hover:text-primary-600 active:scale-95
                   dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300
                   dark:hover:border-accent-500 dark:hover:text-accent-400"
      >
        <Delete className="h-4 w-4" />
        Sil
      </button>
      <button
        type="button"
        onClick={onShuffle}
        className="rounded-full border-2 border-surface-200 bg-white p-3 text-surface-700
                   transition-all duration-150 hover:border-primary-500
                   hover:text-primary-600 active:rotate-180 active:scale-95
                   dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300
                   dark:hover:border-accent-500 dark:hover:text-accent-400"
        aria-label="Harfleri karıştır"
      >
        <Shuffle className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onSubmit}
        className="flex items-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-bold
                   text-white shadow-md shadow-primary-600/30
                   transition-all duration-150 hover:bg-primary-700
                   hover:shadow-lg hover:shadow-primary-600/40 active:scale-95
                   dark:bg-accent-500 dark:shadow-accent-500/30 dark:hover:bg-accent-400"
      >
        <Send className="h-4 w-4" />
        Gönder
      </button>
    </div>
  )
}
