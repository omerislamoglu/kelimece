import { useEffect, useState, useCallback, useRef } from 'react'
import { X, Star, Lock, Check } from 'lucide-react'
import { TOTAL_LEVELS, type LevelProgress } from '../../lib/levels'

interface LevelMapProps {
  progress: LevelProgress
  currentLevel: number
  onSelectLevel: (level: number) => void
  onClose: () => void
}

export default function LevelMap({
  progress,
  currentLevel,
  onSelectLevel,
  onClose,
}: LevelMapProps) {
  const [visible, setVisible] = useState(false)
  const currentRef = useRef<HTMLButtonElement>(null)
  const completedSet = new Set(progress.completedLevels)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  // Auto-scroll to current level
  useEffect(() => {
    if (visible && currentRef.current) {
      setTimeout(() => {
        currentRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 300)
    }
  }, [visible])

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

  function handleSelect(level: number) {
    const isCompleted = completedSet.has(level)
    const isCurrent = level === currentLevel
    if (!isCompleted && !isCurrent) return
    onSelectLevel(level)
    handleClose()
  }

  // Group levels into rows of 5 with snake pattern
  const rows: number[][] = []
  for (let i = 0; i < TOTAL_LEVELS; i += 5) {
    const row = []
    for (let j = 0; j < 5 && i + j < TOTAL_LEVELS; j++) {
      row.push(i + j + 1)
    }
    // Reverse odd rows for snake pattern
    if (rows.length % 2 === 1) row.reverse()
    rows.push(row)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col transition-all duration-200 ${
        visible ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Bolum Haritasi"
    >
      <div
        className={`mx-auto flex w-full max-w-lg flex-1 flex-col overflow-hidden bg-surface-50 transition-all duration-200 sm:my-4 sm:rounded-3xl dark:bg-surface-950 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-200 px-5 py-4 dark:border-surface-800">
          <div>
            <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100">
              Bolum Haritasi
            </h2>
            <p className="text-xs text-surface-400">
              {completedSet.size} / {TOTAL_LEVELS} tamamlandi
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Kapat"
            className="rounded-full p-2 text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Map */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div className="space-y-3">
            {rows.map((row, rowIdx) => (
              <div
                key={rowIdx}
                className="flex items-center justify-center gap-2"
              >
                {row.map((level) => {
                  const isCompleted = completedSet.has(level)
                  const isCurrent = level === currentLevel
                  const isLocked = !isCompleted && !isCurrent
                  const stars = progress.levelStars[level] ?? 0

                  return (
                    <button
                      key={level}
                      ref={isCurrent ? currentRef : undefined}
                      onClick={() => handleSelect(level)}
                      disabled={isLocked}
                      className={`
                        relative flex h-14 w-14 flex-col items-center justify-center rounded-2xl
                        text-sm font-bold transition-all duration-150
                        ${
                          isCurrent
                            ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-600/40 ring-2 ring-primary-400/50 dark:from-accent-400 dark:to-accent-500 dark:text-surface-900 dark:shadow-accent-500/30 dark:ring-accent-300/50'
                            : isCompleted
                              ? 'bg-primary-50 text-surface-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 dark:bg-surface-800 dark:text-surface-200'
                              : 'bg-surface-100 text-surface-300 cursor-default dark:bg-surface-900 dark:text-surface-700'
                        }
                      `}
                    >
                      {isLocked ? (
                        <Lock className="h-4 w-4" />
                      ) : isCompleted ? (
                        <>
                          <span className="text-xs leading-none">{level}</span>
                          <div className="mt-0.5 flex gap-px">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`h-2.5 w-2.5 ${
                                  s <= stars
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-surface-300 dark:text-surface-600'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      ) : (
                        <span>{level}</span>
                      )}

                      {/* Current level pulse */}
                      {isCurrent && (
                        <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75 dark:bg-accent-400" />
                          <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-primary-500 dark:bg-accent-400" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Bottom legend */}
          <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-surface-400">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-gradient-to-br from-primary-500 to-primary-700 dark:from-accent-400 dark:to-accent-500" />
              Suanki
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3" />
              Tamamlanan
            </div>
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Kilitli
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
