import { useEffect, useState, useCallback, useRef } from 'react'
import { Star, ChevronRight, Coins } from 'lucide-react'
import { calculateStars, type LevelPuzzle } from '../../lib/levels'
import { playLevelComplete, playCoin, vibrate } from '../../lib/sounds'
import { showInterstitialIfReady } from '../../lib/adService'
import ShareButton from '../ShareButton'
import { useFocusTrap } from '../../hooks/useFocusTrap'

interface LevelCompleteProps {
  puzzle: LevelPuzzle
  foundWords: string[]
  score: number
  onNextLevel: () => void
  onClose: () => void
  onMessage: (
    text: string,
    type: 'success' | 'error' | 'info' | 'warning',
  ) => void
}

function useCountUp(target: number, duration = 800, delay = 400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now()
      function tick() {
        const elapsed = performance.now() - start
        const progress = Math.min(elapsed / duration, 1)
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(Math.round(eased * target))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timeout)
  }, [target, duration, delay])
  return value
}

export default function LevelComplete({
  puzzle,
  foundWords,
  score,
  onNextLevel,
  onClose,
  onMessage,
}: LevelCompleteProps) {
  const [visible, setVisible] = useState(false)
  const [showingAd, setShowingAd] = useState(false)
  const [starsRevealed, setStarsRevealed] = useState(0)
  const [coinFlies, setCoinFlies] = useState<number[]>([])
  const coinTargetRef = useRef<HTMLDivElement>(null)
  const dialogRef = useFocusTrap<HTMLDivElement>(visible)

  const stars = calculateStars(
    foundWords.length,
    puzzle.targetWordCount,
    puzzle.validWords.length,
  )

  const animatedWords = useCountUp(foundWords.length, 600, 500)
  const animatedScore = useCountUp(score, 800, 500)

  // Open animation
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    playLevelComplete()
    vibrate([50, 30, 50, 30, 80])
  }, [])

  // Stars reveal one by one
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    for (let i = 1; i <= stars; i++) {
      timers.push(
        setTimeout(
          () => {
            setStarsRevealed(i)
            vibrate(30)
          },
          600 + i * 300,
        ),
      )
    }
    return () => timers.forEach(clearTimeout)
  }, [stars])

  // Coin fly animation
  useEffect(() => {
    const count = Math.min(foundWords.length, 8)
    const timers: ReturnType<typeof setTimeout>[] = []
    for (let i = 0; i < count; i++) {
      timers.push(
        setTimeout(
          () => {
            setCoinFlies((prev) => [...prev, Date.now() + i])
            playCoin()
          },
          1400 + i * 100,
        ),
      )
    }
    return () => timers.forEach(clearTimeout)
  }, [foundWords.length])

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 200)
  }, [onClose])

  const handleNextLevel = useCallback(async () => {
    setShowingAd(true)
    try {
      const adShown = await showInterstitialIfReady()
      if (!adShown) {
        // Reklam gosterilmediyse kisa bekleme
        await new Promise((r) => setTimeout(r, 300))
      }
    } catch {
      // Reklam hatasi — devam et
    }
    setShowingAd(false)
    onNextLevel()
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
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] ${
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
        ref={dialogRef}
        tabIndex={-1}
        className={`relative w-full max-w-sm rounded-2xl bg-surface-50 p-6 shadow-2xl transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] dark:bg-surface-900 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Coin fly targets */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          {coinFlies.map((id) => (
            <div
              key={id}
              className="absolute left-1/2 top-1/2 animate-coin-fly"
              style={
                {
                  '--fly-x': '0px',
                  '--fly-y': '-120px',
                } as React.CSSProperties
              }
            >
              <Coins className="h-5 w-5 text-yellow-500" />
            </div>
          ))}
        </div>

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
        <div className="mb-5 flex justify-center gap-2" ref={coinTargetRef}>
          {[1, 2, 3].map((i) => (
            <Star
              key={i}
              className={`h-10 w-10 transition-all ${
                i <= starsRevealed
                  ? 'animate-star-pop fill-yellow-400 text-yellow-400 drop-shadow-md'
                  : 'text-surface-300 scale-75 dark:text-surface-700'
              }`}
              style={{
                animationDelay: `${(i - 1) * 100}ms`,
                animationFillMode: 'both',
              }}
            />
          ))}
        </div>

        {/* Istatistikler — animated */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-surface-100 p-3 text-center dark:bg-surface-800">
            <div className="text-2xl font-bold text-primary-600 dark:text-accent-400">
              {animatedWords}
            </div>
            <div className="text-xs font-medium text-surface-400">
              Kelime Bulundu
            </div>
          </div>
          <div className="rounded-xl bg-surface-100 p-3 text-center dark:bg-surface-800">
            <div className="text-2xl font-bold text-primary-600 dark:text-accent-400">
              {animatedScore}
            </div>
            <div className="text-xs font-medium text-surface-400">Puan</div>
          </div>
        </div>

        {/* Paylas butonu */}
        <div className="mb-3 flex justify-center">
          <ShareButton
            level={puzzle.level}
            foundWords={foundWords}
            totalWords={puzzle.validWords.length}
            stars={stars}
            score={score}
            onMessage={onMessage}
          />
        </div>

        {/* Sonraki Bolum butonu */}
        <button
          onClick={handleNextLevel}
          aria-label="Sonraki bölüme geç"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-primary-600/30 transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-primary-700 hover:shadow-xl active:scale-[0.98] dark:bg-accent-500 dark:shadow-accent-500/30 dark:hover:bg-accent-400"
        >
          Sonraki Bolum
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
