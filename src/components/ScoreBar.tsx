import { useMemo } from 'react'
import { RANKS, getRankFromScore } from '../lib/puzzle'

interface ScoreBarProps {
  score: number
  maxScore: number
  scoreBump?: boolean
}

export default function ScoreBar({ score, maxScore, scoreBump }: ScoreBarProps) {
  const rank = getRankFromScore(score, maxScore)
  const ratio = maxScore > 0 ? score / maxScore : 0
  const percentage = Math.min(ratio * 100, 100)

  const rankThresholds = useMemo(() => {
    if (maxScore === 0) return []
    return RANKS.map((r) => ({
      label: r.label,
      position: r.threshold * 100,
      isActive: score >= r.threshold * maxScore,
    }))
  }, [score, maxScore])

  return (
    <div className="w-full" role="progressbar" aria-valuenow={score} aria-valuemax={maxScore} aria-label={`Skor: ${score}, Rutbe: ${rank}`}>
      <div className="mb-2 flex items-baseline justify-between">
        <span
          key={rank}
          className="animate-rank-pop text-base font-bold text-primary-600 dark:text-accent-400"
        >
          {rank}
        </span>
        <span className={`text-xs font-medium text-surface-400 ${scoreBump ? 'animate-score-bump' : ''}`}>
          {score} puan
        </span>
      </div>

      <div className="relative h-1.5 w-full rounded-full bg-surface-200 dark:bg-surface-800">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
        {rankThresholds.map((r) => (
          <div
            key={r.label}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${r.position}%` }}
          >
            <div
              className={`h-2.5 w-2.5 rounded-full border-2 transition-colors duration-300 ${
                r.isActive
                  ? 'border-primary-600 bg-accent-500 dark:border-accent-400 dark:bg-accent-500'
                  : 'border-surface-300 bg-surface-100 dark:border-surface-700 dark:bg-surface-900'
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
