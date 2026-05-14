import { useMemo } from 'react'
import { RANKS, getRankFromScore } from '../lib/puzzle'

interface ScoreBarProps {
  score: number
  maxScore: number
}

export default function ScoreBar({ score, maxScore }: ScoreBarProps) {
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
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between">
        <span
          key={rank}
          className="animate-rank-pop text-base font-bold text-honey-600"
        >
          {rank}
        </span>
        <span className="text-xs font-medium text-bark-600/60">
          {score} puan
        </span>
      </div>

      <div className="relative h-1.5 w-full rounded-full bg-cream-200">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-honey-400 to-honey-300 transition-all duration-500 ease-out"
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
                  ? 'border-honey-500 bg-honey-400'
                  : 'border-cream-300 bg-cream-100'
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
