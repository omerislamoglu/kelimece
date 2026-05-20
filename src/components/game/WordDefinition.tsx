import { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import {
  fetchDefinition,
  type WordDefinition as Def,
} from '../../lib/definitions'
import { useFocusTrap } from '../../hooks/useFocusTrap'

interface WordDefinitionProps {
  word: string
  onClose: () => void
}

export default function WordDefinition({ word, onClose }: WordDefinitionProps) {
  const [def, setDef] = useState<Def | null>(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const dialogRef = useFocusTrap<HTMLDivElement>(visible)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchDefinition(word).then((result) => {
      if (cancelled) return
      setDef(result)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [word])

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 200)
  }, [onClose])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleClose])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-all duration-200 ${
        visible ? 'bg-black/40 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`${word} tanımı`}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative w-full max-w-sm bg-surface-50 shadow-2xl transition-all duration-200 dark:bg-surface-900
          rounded-t-3xl sm:rounded-2xl
          ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 sm:translate-y-0 sm:scale-95'}`}
      >
        {/* Mobile handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-surface-300 dark:bg-surface-700" />
        </div>

        <div className="px-5 pt-3 pb-5 sm:p-6">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold capitalize text-surface-900 dark:text-surface-100">
                {word}
              </h3>
              {!loading && def?.type && (
                <span className="text-xs font-medium text-primary-600 dark:text-accent-400">
                  {def.type}
                </span>
              )}
            </div>
            <button
              onClick={handleClose}
              aria-label="Kapat"
              className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="space-y-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-surface-200 dark:bg-surface-800" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-surface-200 dark:bg-surface-800" />
            </div>
          ) : def ? (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-surface-700 dark:text-surface-300">
                {def.meaning}
              </p>
              {def.example && (
                <blockquote className="border-l-2 border-primary-500/40 pl-3 text-xs italic text-surface-500 dark:border-accent-500/40 dark:text-surface-400">
                  {def.example}
                </blockquote>
              )}
            </div>
          ) : (
            <p className="text-sm text-surface-400">Tanim bulunamadi</p>
          )}
        </div>
      </div>
    </div>
  )
}
