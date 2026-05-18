import { useEffect, useMemo } from 'react'
import { Delete, Shuffle, Send } from 'lucide-react'

interface ControlsProps {
  letters: string[]
  currentInput: string
  onLetterClick: (letter: string) => void
  onDelete: () => void
  onClear: () => void
  onShuffle: () => void
  onSubmit: () => void
}

export default function Controls({
  letters,
  currentInput,
  onLetterClick,
  onDelete,
  onClear,
  onShuffle,
  onSubmit,
}: ControlsProps) {
  const availableCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const ch of letters) {
      counts.set(ch, (counts.get(ch) ?? 0) + 1)
    }
    return counts
  }, [letters])

  const usedCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const ch of currentInput) {
      counts.set(ch, (counts.get(ch) ?? 0) + 1)
    }
    return counts
  }, [currentInput])

  useEffect(() => {
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

      if (e.key === 'Escape') {
        e.preventDefault()
        onClear()
        return
      }

      if (e.key === ' ') {
        e.preventDefault()
        onShuffle()
        return
      }

      const key = e.key.toLocaleLowerCase('tr-TR')
      const available = availableCounts.get(key) ?? 0
      const used = usedCounts.get(key) ?? 0
      if (available > 0 && used < available) {
        e.preventDefault()
        onLetterClick(key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    availableCounts,
    usedCounts,
    onLetterClick,
    onDelete,
    onClear,
    onShuffle,
    onSubmit,
  ])

  return (
    <div
      className="flex items-center justify-center gap-3"
      role="toolbar"
      aria-label="Oyun kontrolleri"
    >
      <button
        type="button"
        onClick={onDelete}
        aria-label="Son harfi sil"
        className="flex items-center gap-1.5 rounded-2xl bg-surface-100 px-5 py-3 text-sm
                   font-semibold text-surface-600 transition-all duration-150
                   hover:bg-surface-200 active:scale-95
                   focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none
                   dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
      >
        <Delete className="h-4 w-4" />
        Sil
      </button>
      <button
        type="button"
        onClick={onShuffle}
        aria-label="Harfleri karistir"
        className="rounded-2xl bg-surface-100 p-3 text-surface-600
                   transition-all duration-150 hover:bg-surface-200
                   active:rotate-180 active:scale-95
                   focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none
                   dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
      >
        <Shuffle className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onSubmit}
        aria-label="Kelimeyi gonder"
        className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-3 text-sm font-bold
                   text-white shadow-lg shadow-primary-600/25
                   transition-all duration-150 hover:shadow-xl hover:shadow-primary-600/30 active:scale-95
                   focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none
                   dark:from-accent-500 dark:to-accent-400 dark:text-surface-900 dark:shadow-accent-500/25"
      >
        <Send className="h-4 w-4" />
        Gonder
      </button>
    </div>
  )
}
