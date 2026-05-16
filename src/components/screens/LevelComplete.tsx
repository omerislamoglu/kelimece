import { useEffect, useState, useCallback } from 'react'
import { Star, ChevronRight } from 'lucide-react'
import { calculateStars, type LevelPuzzle } from '../../lib/levels'

interface LevelCompleteProps {
  puzzle: LevelPuzzle
  foundWords: string[]
  score: number
  onNextLevel: () => void
  onClose: () => void
}

export default function LevelComplete({
  puzzle,
  foundWords,
  score,
  onNextLevel,
  onClose,
}: LevelCompleteProps) {
  const [visible, setVisible] = useState(false)
  const [showingAd, setShowingAd] = useState(false)

  const stars = calculateStars(
    foundWords.length,
    puzzle.targetWordCount,
    puzzle.validWords.length,
  )

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 200)
  }, [onClose])

  const handleNextLevel = useCallback(() => {
    // AdMob placeholder — gercek reklam Capacitor entegrasyonunda eklenecek
    setShowingAd(true)
    setTimeout(() => {
      setShowingAd(false)
      onNextLevel()
    }, 1500)
  }, [onNextLevel])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleClose])

  if (showingAd) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="text-center">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white mx-auto" />
          <p className="text-sm text-white/70">Reklam yukleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Bolum tamamlandi"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div
        className={`relative w-full max-w-sm rounded-2xl bg-surface-50 p-6 shadow-2xl transition-all duration-200 dark:bg-surface-900 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Baslik */}
        <div className="mb-4 text-center">
          <p className="text-sm font-medium text-primary-600 dark:text-accent-400">
            Bolum {puzzle.level}
          </p>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Tebrikler!
          </h2>
        </div>

        {/* Yildizlar */}
        <div className="mb-5 flex justify-center gap-2">
          {[1, 2, 3].map((i) => (
            <Star
              key={i}
              className={`h-10 w-10 transition-all duration-300 ${
                i <= stars
                  ? 'fill-yellow-400 text-yellow-400 drop-shadow-md'
                  : 'text-surface-300 dark:text-surface-700'
              }`}
              style={{
                transitionDelay: `${i * 150}ms`,
                transform: i <= stars ? 'scale(1)' : 'scale(0.8)',
              }}
            />
          ))}
        </div>

        {/* Istatistikler */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-surface-100 p-3 text-center dark:bg-surface-800">
            <div className="text-2xl font-bold text-primary-600 dark:text-accent-400">
              {foundWords.length}
            </div>
            <div className="text-xs font-medium text-surface-400">
              Kelime Bulundu
            </div>
          </div>
          <div className="rounded-xl bg-surface-100 p-3 text-center dark:bg-surface-800">
            <div className="text-2xl font-bold text-primary-600 dark:text-accent-400">
              {score}
            </div>
            <div className="text-xs font-medium text-surface-400">Puan</div>
          </div>
        </div>

        {/* Sonraki Bolum butonu */}
        <button
          onClick={handleNextLevel}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-primary-600/30 transition-all hover:bg-primary-700 hover:shadow-xl active:scale-[0.98] dark:bg-accent-500 dark:shadow-accent-500/30 dark:hover:bg-accent-400"
        >
          Sonraki Bolum
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
