import { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { getStats, type GameStats } from '../lib/stats'

interface StatsPanelProps {
  onClose: () => void
}

function StatCard({
  value,
  label,
}: {
  value: string | number
  label: string
}) {
  return (
    <div className="rounded-xl bg-surface-100 p-3 text-center dark:bg-surface-800">
      <div className="text-xl font-bold text-primary-600 dark:text-accent-400">
        {value}
      </div>
      <div className="text-[11px] font-medium leading-tight text-surface-400">
        {label}
      </div>
    </div>
  )
}

export default function StatsPanel({ onClose }: StatsPanelProps) {
  const [stats, setStats] = useState<GameStats | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setStats(getStats())
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

  if (!stats) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div
        className={`relative w-full max-w-sm rounded-2xl bg-surface-50 p-6 shadow-2xl transition-all duration-200 dark:bg-surface-900 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Kapat butonu */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-5 text-center text-xl font-bold text-surface-900 dark:text-surface-100">
          Istatistikler
        </h2>

        <div className="grid grid-cols-3 gap-3">
          <StatCard value={stats.gamesPlayed} label="Oynanan Gun" />
          <StatCard value={stats.currentStreak} label="Mevcut Seri" />
          <StatCard value={stats.longestStreak} label="En Uzun Seri" />
          <StatCard value={stats.totalWords} label="Toplam Kelime" />
          <StatCard value={stats.avgScore} label="Ortalama Skor" />
          <StatCard value={stats.highScore} label="En Yuksek Skor" />
        </div>
      </div>
    </div>
  )
}
