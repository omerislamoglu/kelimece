import { useEffect, useState, useCallback, useRef } from 'react'
import {
  X,
  Trophy,
  Star,
  Flame,
  BookOpen,
  Sparkles,
  Diamond,
  Lightbulb,
  Coins,
  Calendar,
} from 'lucide-react'
import { getStats, type GameStats } from '../../lib/stats'
import { loadProgress } from '../../lib/levels'

interface StatsPanelProps {
  onClose: () => void
}

type Tab = 'genel' | 'bolumler' | 'kelimeler'

function AnimatedNumber({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const start = 0
    const duration = 600
    const startTime = performance.now()

    function animate(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(start + (value - start) * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value])

  return <>{displayed}</>
}

function StatCard({
  icon: Icon,
  value,
  label,
  stringValue,
}: {
  icon: React.ElementType
  value?: number
  label: string
  stringValue?: string
}) {
  return (
    <div className="rounded-xl bg-surface-100 p-3 text-center dark:bg-surface-800">
      <Icon className="mx-auto mb-1 h-5 w-5 text-primary-500 dark:text-accent-400" />
      <div className="text-xl font-bold text-surface-900 dark:text-surface-100">
        {stringValue ?? (value !== undefined ? <AnimatedNumber value={value} /> : 0)}
      </div>
      <div className="text-[11px] font-medium leading-tight text-surface-400">
        {label}
      </div>
    </div>
  )
}

export default function StatsPanel({ onClose }: StatsPanelProps) {
  const [stats] = useState<GameStats>(() => getStats())
  const [progress] = useState(() => loadProgress())
  const [visible, setVisible] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('genel')

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

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

  const totalLevels = progress.completedLevels.length
  const avgStars =
    totalLevels > 0
      ? (
          Object.values(progress.levelStars).reduce((a, b) => a + b, 0) /
          totalLevels
        ).toFixed(1)
      : '0'
  const completionPercent =
    totalLevels > 0 ? Math.round((stats.perfectLevels / totalLevels) * 100) : 0

  const tabs: { key: Tab; label: string }[] = [
    { key: 'genel', label: 'Genel' },
    { key: 'bolumler', label: 'Bolumler' },
    { key: 'kelimeler', label: 'Kelimeler' },
  ]

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Istatistikler"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div
        className={`relative w-full max-w-sm rounded-2xl bg-surface-50 p-6 shadow-2xl transition-all duration-200 dark:bg-surface-900 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <button
          onClick={handleClose}
          aria-label="Kapat"
          className="absolute right-4 top-4 rounded-lg p-1 text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-4 text-center text-xl font-bold text-surface-900 dark:text-surface-100">
          Istatistikler
        </h2>

        {/* Tabs */}
        <div className="mb-4 flex rounded-xl bg-surface-100 p-1 dark:bg-surface-800">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-primary-600 shadow-sm dark:bg-surface-700 dark:text-accent-400'
                  : 'text-surface-400 hover:text-surface-600 dark:hover:text-surface-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="grid grid-cols-2 gap-3">
          {activeTab === 'genel' && (
            <>
              <StatCard
                icon={Trophy}
                value={stats.levelsCompleted}
                label="Tamamlanan Bolum"
              />
              <StatCard
                icon={Star}
                value={stats.totalStars}
                label="Toplam Yildiz"
              />
              <StatCard
                icon={Flame}
                value={stats.playStreak}
                label="Gunluk Seri"
              />
              <StatCard
                icon={Flame}
                value={stats.longestPlayStreak}
                label="En Uzun Seri"
              />
              <StatCard
                icon={Coins}
                value={stats.coinsEarned}
                label="Kazanilan Jeton"
              />
              <StatCard
                icon={Calendar}
                stringValue={
                  stats.firstPlayDate
                    ? new Date(stats.firstPlayDate).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                      })
                    : '-'
                }
                label="Ilk Oyun"
              />
            </>
          )}

          {activeTab === 'bolumler' && (
            <>
              <StatCard
                icon={Star}
                value={stats.perfectLevels}
                label="3 Yildiz Bolum"
              />
              <StatCard
                icon={Trophy}
                value={stats.levelsCompleted}
                label="Tamamlanan"
              />
              <StatCard
                icon={Sparkles}
                stringValue={avgStars}
                label="Ortalama Yildiz"
              />
              <StatCard
                icon={Trophy}
                stringValue={`%${completionPercent}`}
                label="Mukemmel Oran"
              />
              <StatCard
                icon={Lightbulb}
                value={stats.hintsUsed}
                label="Ipucu Kullanilan"
              />
              <StatCard
                icon={Coins}
                value={stats.coinsSpent}
                label="Harcanan Jeton"
              />
            </>
          )}

          {activeTab === 'kelimeler' && (
            <>
              <StatCard
                icon={BookOpen}
                value={stats.totalWordsFound}
                label="Hedef Kelime"
              />
              <StatCard
                icon={Sparkles}
                value={stats.totalBonusWords}
                label="Bonus Kelime"
              />
              <StatCard
                icon={Diamond}
                value={stats.totalPangrams}
                label="Tam Kelime"
              />
              <StatCard
                icon={BookOpen}
                stringValue={stats.longestWordFound || '-'}
                label="En Uzun Kelime"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
