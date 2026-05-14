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
      points: Math.ceil(r.threshold * maxScore),
      isActive: score >= r.threshold * maxScore,
    }))
  }, [score, maxScore])

  return (
    <div className="w-full max-w-sm">
      <div className="mb-2 flex items-baseline justify-between">
        <span
          key={rank}
          className="animate-rank text-lg font-bold text-amber-600"
        >
          {rank}
        </span>
        <span className="text-sm text-gray-500">{score} puan</span>
      </div>

      <div className="relative h-2 w-full rounded-full bg-gray-200">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-amber-400 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
        {rankThresholds.map((r) => (
          <div
            key={r.label}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${r.position}%` }}
          >
            <div
              className={`h-3 w-3 rounded-full border-2 transition-colors duration-300 ${
                r.isActive
                  ? 'border-amber-500 bg-amber-400'
                  : 'border-gray-300 bg-white'
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
