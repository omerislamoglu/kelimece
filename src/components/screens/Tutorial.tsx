import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronRight, ChevronLeft, X } from 'lucide-react'
import { completeTutorial } from '../../lib/tutorial'
import { useFocusTrap } from '../../hooks/useFocusTrap'

// --- Mini harf grid (animasyonlu) ---

const DEMO_LETTERS = ['A', 'K', 'L', 'E', 'M', 'İ', 'R']
const ANGLES = [0, 60, 120, 180, 240, 300]
const RADIUS = 40

function MiniGrid() {
  const [highlighted, setHighlighted] = useState<number[]>([])
  useEffect(() => {
    // "KELİME" kelimesini sırayla vurgula: K(1) E(3) L(2) İ(5) M(4) E(3)
    const sequence = [1, 3, 2, 5, 4, 3]
    const timers: ReturnType<typeof setTimeout>[] = []
    let step = 0

    function animate() {
      if (step < sequence.length) {
        setHighlighted((prev) => [...prev, sequence[step]])
        step++
        timers.push(setTimeout(animate, 400))
      } else {
        timers.push(
          setTimeout(() => {
            setHighlighted([])
            step = 0
            timers.push(setTimeout(animate, 600))
          }, 1000),
        )
      }
    }

    timers.push(setTimeout(animate, 500))
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div
      className="relative mx-auto"
      style={{ width: '160px', height: '160px' }}
    >
      {/* Merkez */}
      <div
        className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-base font-bold text-white shadow-md dark:bg-accent-500"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      >
        {DEMO_LETTERS[0]}
      </div>
      {/* Cevredekiler */}
      {DEMO_LETTERS.slice(1).map((letter, i) => {
        const angle = (ANGLES[i] - 90) * (Math.PI / 180)
        const x = Math.cos(angle) * RADIUS
        const y = Math.sin(angle) * RADIUS
        const isHit = highlighted.includes(i + 1)

        return (
          <div
            key={i}
            className={`absolute flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-200 ${
              isHit
                ? 'scale-110 bg-primary-600 text-white shadow-lg dark:bg-accent-500'
                : 'bg-primary-50 text-surface-700 shadow-md dark:bg-surface-800 dark:text-surface-200'
            }`}
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {letter}
          </div>
        )
      })}
    </div>
  )
}

// --- Ekranlar ---

function Screen1() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
      <MiniGrid />
      <div className="text-center">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Kelimece'ye hos geldin
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-surface-500 dark:text-surface-400">
          Her gun yeni bir bulmaca. 7 harften mumkun oldugunca cok kelime bul.
        </p>
      </div>
    </div>
  )
}

function Screen2() {
  const rules = [
    'Kelimeler en az 4 harfli olmali',
    'Her kelime ortadaki harfi icermeli',
    'Harfler birden fazla kullanilabilir',
    'Sadece Turkce sozlukte olan kelimeler',
  ]

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/30">
        <span className="text-3xl">&#x1F4CB;</span>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Kurallar
        </h2>
      </div>
      <ul className="w-full max-w-xs space-y-3">
        {rules.map((rule, i) => (
          <li
            key={i}
            className="flex items-start gap-3 text-sm text-surface-700 dark:text-surface-300"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/30 dark:text-accent-400">
              {i + 1}
            </span>
            {rule}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Screen3() {
  const scoring = [
    { label: '4 harf', value: '1 puan' },
    { label: 'Her ek harf', value: '+1 puan' },
    { label: 'Tam Kelime (7 harf)', value: '+7 bonus' },
  ]

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/30">
        <span className="text-3xl">&#x2B50;</span>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Puanlama
        </h2>
      </div>
      <div className="w-full max-w-xs space-y-2">
        {scoring.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl bg-surface-100 px-4 py-3 dark:bg-surface-800"
          >
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
              {item.label}
            </span>
            <span className="text-sm font-bold text-primary-600 dark:text-accent-400">
              {item.value}
            </span>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-surface-400">
        Yuksek skor = yuksek rutbe
      </p>
    </div>
  )
}

function Screen4({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
        <span className="text-4xl">&#x1F680;</span>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Hazir misin?
        </h2>
        <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
          Bugunkü bulmaca seni bekliyor
        </p>
      </div>
      <button
        onClick={onStart}
        aria-label="Bulmacaya başla"
        className="mt-2 rounded-2xl bg-primary-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/30 transition-colors hover:bg-primary-700 active:bg-primary-800 dark:bg-accent-500 dark:shadow-accent-500/20 dark:hover:bg-accent-400"
      >
        Bulmacaya Basla
      </button>
    </div>
  )
}

// --- Tutorial ana bileşen ---

const TOTAL_SCREENS = 4

interface TutorialProps {
  onComplete: () => void
}

export default function Tutorial({ onComplete }: TutorialProps) {
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right'>('left')
  const [animating, setAnimating] = useState(false)
  const [visible, setVisible] = useState(false)
  const dialogRef = useFocusTrap<HTMLDivElement>(visible)

  // Touch/swipe
  const touchStartX = useRef(0)
  const touchDelta = useRef(0)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const finish = useCallback(() => {
    completeTutorial()
    setVisible(false)
    setTimeout(onComplete, 200)
  }, [onComplete])

  function goTo(next: number) {
    if (animating || next < 0 || next >= TOTAL_SCREENS) return
    setDirection(next > page ? 'left' : 'right')
    setAnimating(true)
    setTimeout(() => {
      setPage(next)
      setAnimating(false)
    }, 200)
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchDelta.current = 0
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchDelta.current = e.touches[0].clientX - touchStartX.current
  }

  function handleTouchEnd() {
    if (Math.abs(touchDelta.current) > 50) {
      if (touchDelta.current < 0 && page < TOTAL_SCREENS - 1) {
        goTo(page + 1)
      } else if (touchDelta.current > 0 && page > 0) {
        goTo(page - 1)
      }
    }
  }

  const slideClass = animating
    ? direction === 'left'
      ? '-translate-x-4 opacity-0'
      : 'translate-x-4 opacity-0'
    : 'translate-x-0 opacity-100'

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      className={`fixed inset-0 z-[70] flex flex-col bg-surface-50 transition-opacity duration-200 dark:bg-surface-950 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Atla butonu */}
      {page < TOTAL_SCREENS - 1 && (
        <div className="flex justify-end px-4 pt-4">
          <button
            onClick={finish}
            aria-label="Öğreticiyi atla"
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-surface-400 transition-colors hover:text-surface-600 dark:hover:text-surface-300"
          >
            Atla
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {page === TOTAL_SCREENS - 1 && <div className="h-12" />}

      {/* Ekran icerik */}
      <div
        className={`flex flex-1 transition-all duration-200 ease-out ${slideClass}`}
      >
        {page === 0 && <Screen1 />}
        {page === 1 && <Screen2 />}
        {page === 2 && <Screen3 />}
        {page === 3 && <Screen4 onStart={finish} />}
      </div>

      {/* Alt navigasyon */}
      <div className="flex items-center justify-between px-6 pb-8 pt-4">
        {/* Geri */}
        <button
          onClick={() => goTo(page - 1)}
          disabled={page === 0}
          aria-label="Önceki öğretici sayfası"
          className="flex h-10 w-10 items-center justify-center rounded-full text-surface-400 transition-colors hover:bg-surface-200 disabled:invisible dark:hover:bg-surface-800"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Sayfa noktalari */}
        <div className="flex gap-2">
          {Array.from({ length: TOTAL_SCREENS }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-200 ${
                i === page
                  ? 'w-6 bg-primary-600 dark:bg-accent-500'
                  : 'w-2 bg-surface-300 dark:bg-surface-700'
              }`}
            />
          ))}
        </div>

        {/* İleri */}
        {page < TOTAL_SCREENS - 1 ? (
          <button
            onClick={() => goTo(page + 1)}
            aria-label="Sonraki öğretici sayfası"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white shadow-md transition-colors hover:bg-primary-700 dark:bg-accent-500 dark:hover:bg-accent-400"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : (
          <div className="h-10 w-10" />
        )}
      </div>
    </div>
  )
}
