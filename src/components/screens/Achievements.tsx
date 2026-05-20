import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  X,
  Sparkles,
  BookOpen,
  Target,
  Library,
  Crown,
  Flag,
  Award,
  Trophy,
  Star,
  Gem,
  Zap,
  Flame,
  Rocket,
  Gift,
  Package,
  Calendar,
  CalendarCheck,
  Heart,
  MessageCircle,
  Brain,
  Moon,
  Ruler,
  Lock,
  Coins,
} from 'lucide-react'
import { ACHIEVEMENTS, type Achievement } from '../../data/achievements'
import {
  getUnlockedIds,
  getProgress,
  type AchievementProgress,
} from '../../lib/achievements'
import { getStats } from '../../lib/stats'

interface AchievementsProps {
  onClose: () => void
}

const ICON_MAP: Record<string, typeof Sparkles> = {
  sparkles: Sparkles,
  'book-open': BookOpen,
  target: Target,
  library: Library,
  crown: Crown,
  flag: Flag,
  award: Award,
  trophy: Trophy,
  star: Star,
  gem: Gem,
  zap: Zap,
  flame: Flame,
  rocket: Rocket,
  gift: Gift,
  package: Package,
  calendar: Calendar,
  'calendar-check': CalendarCheck,
  heart: Heart,
  'message-circle': MessageCircle,
  brain: Brain,
  moon: Moon,
  ruler: Ruler,
}

type Filter = 'all' | 'unlocked' | 'locked'

export default function Achievements({ onClose }: AchievementsProps) {
  const [visible, setVisible] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')

  const stats = useMemo(() => getStats(), [])
  const unlockedIds = useMemo(() => getUnlockedIds(), [])

  const achievements = useMemo(() => {
    return ACHIEVEMENTS.map((a) => ({
      ...a,
      unlocked: unlockedIds.has(a.id),
      progress: getProgress(a.id, stats),
    }))
  }, [stats, unlockedIds])

  const filtered = useMemo(() => {
    switch (filter) {
      case 'unlocked':
        return achievements.filter((a) => a.unlocked)
      case 'locked':
        return achievements.filter((a) => !a.unlocked)
      default:
        return achievements
    }
  }, [achievements, filter])

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalCount = achievements.length
  const pct = Math.round((unlockedCount / totalCount) * 100)

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

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col transition-all duration-200 ${
        visible ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Başarılar"
    >
      <div
        className={`mx-auto flex w-full max-w-lg flex-1 flex-col overflow-hidden bg-surface-50 transition-all duration-200 sm:my-4 sm:rounded-3xl dark:bg-surface-950 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="border-b border-surface-200 px-5 py-4 dark:border-surface-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100">
                Başarılar
              </h2>
              <p className="text-xs text-surface-400">
                {unlockedCount} / {totalCount} açıldı ({pct}%)
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

          {/* Progress bar */}
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-200 dark:bg-surface-800">
            <div
              className="h-full rounded-full bg-yellow-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Filters */}
          <div className="mt-3 flex gap-2">
            {([
              ['all', 'Tümü'],
              ['unlocked', 'Açık'],
              ['locked', 'Kilitli'],
            ] as [Filter, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                  filter === key
                    ? 'bg-primary-600 text-white dark:bg-accent-500'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-1 gap-3">
            {filtered.map((a) => (
              <AchievementCard
                key={a.id}
                achievement={a}
                unlocked={a.unlocked}
                progress={a.progress}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AchievementCard({
  achievement,
  unlocked,
  progress,
}: {
  achievement: Achievement
  unlocked: boolean
  progress: AchievementProgress
}) {
  const Icon = ICON_MAP[achievement.icon] ?? Star
  const isSecret = achievement.secret && !unlocked
  const pct =
    progress.target > 0
      ? Math.min((progress.current / progress.target) * 100, 100)
      : 0

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl p-3.5 transition-all ${
        unlocked
          ? 'bg-yellow-500/5 ring-1 ring-yellow-500/20'
          : 'bg-surface-100/50 dark:bg-surface-800/50'
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          unlocked
            ? 'bg-yellow-500/10 text-yellow-500'
            : 'bg-surface-200 text-surface-400 dark:bg-surface-700'
        }`}
      >
        {isSecret ? (
          <Lock className="h-5 w-5" />
        ) : (
          <Icon className="h-5 w-5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-semibold ${
            unlocked
              ? 'text-surface-800 dark:text-surface-200'
              : isSecret
                ? 'text-surface-400 italic'
                : 'text-surface-600 dark:text-surface-400'
          }`}
        >
          {isSecret ? '???' : achievement.title}
        </p>
        <p className="text-xs text-surface-400 truncate">
          {isSecret ? 'Gizli başarı' : achievement.description}
        </p>

        {/* Progress bar (only for non-unlocked, non-secret) */}
        {!unlocked && !isSecret && progress.target > 1 && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700">
              <div
                className="h-full rounded-full bg-primary-500/60 dark:bg-accent-500/60 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold text-surface-400">
              {progress.current}/{progress.target}
            </span>
          </div>
        )}
      </div>

      {/* Reward */}
      <div
        className={`flex shrink-0 items-center gap-0.5 text-xs font-bold ${
          unlocked
            ? 'text-yellow-500'
            : 'text-surface-300 dark:text-surface-600'
        }`}
      >
        <Coins className="h-3.5 w-3.5" />
        {achievement.reward}
      </div>
    </div>
  )
}
