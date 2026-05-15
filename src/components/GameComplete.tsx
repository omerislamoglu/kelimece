import { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import type { Puzzle } from '../types'
import { getRankFromScore } from '../lib/puzzle'
import { getTimeUntilNextPuzzle } from '../lib/countdown'
import ShareButton from './ShareButton'

interface GameCompleteProps {
  puzzle: Puzzle
  foundWords: string[]
  score: number
  maxScore: number
  onClose: () => void
  onMessage: (text: string, type: 'success' | 'error' | 'info') => void
}

function getCongratMessage(score: number, maxScore: number): string {
  if (maxScore === 0) return 'Harika is!'
  const ratio = score / maxScore
  if (ratio >= 0.9) return 'Efsane!'
  if (ratio >= 0.6) return 'Mukemmel!'
  return 'Harika is!'
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export default function GameComplete({
  puzzle,
  foundWords,
  score,
  maxScore,
  onClose,
  onMessage,
}: GameCompleteProps) {
  const [countdown, setCountdown] = useState(getTimeUntilNextPuzzle())
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilNextPuzzle())
    }, 1000)
    return () => clearInterval(timer)
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

  const rank = getRankFromScore(score, maxScore)
  const missedWords = puzzle.validWords.filter((w) => !foundWords.includes(w))
  const allFound = foundWords.length === puzzle.validWords.length

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Oyun sonucu"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div
        className={`relative w-full max-w-sm rounded-2xl bg-surface-50 p-6 shadow-2xl transition-all duration-200 dark:bg-surface-900 ${
          visible
            ? 'scale-100 opacity-100'
            : 'scale-95 opacity-0'
        }`}
      >
        {/* Kapat butonu */}
        <button
          onClick={handleClose}
          aria-label="Kapat"
          className="absolute right-4 top-4 rounded-lg p-1 text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Tebrik */}
        <div className="mb-5 text-center">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            {getCongratMessage(score, maxScore)}
          </h2>
          {allFound && (
            <p className="mt-1 text-sm font-medium text-success-500">
              Tum kelimeleri buldun!
            </p>
          )}
        </div>

        {/* Skor ve istatistik */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-surface-100 p-3 text-center dark:bg-surface-800">
            <div className="text-2xl font-bold text-primary-600 dark:text-accent-400">
              {score}
            </div>
            <div className="text-xs font-medium text-surface-400">
              Skor — {rank}
            </div>
          </div>
          <div className="rounded-xl bg-surface-100 p-3 text-center dark:bg-surface-800">
            <div className="text-2xl font-bold text-primary-600 dark:text-accent-400">
              {foundWords.length}/{puzzle.validWords.length}
            </div>
            <div className="text-xs font-medium text-surface-400">
              Kelime
            </div>
          </div>
        </div>

        {/* Kacirilan kelimeler */}
        {missedWords.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-surface-400">
              Kacirdiklarin:
            </h3>
            <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
              {missedWords.sort().map((word) => (
                <span
                  key={word}
                  className={`rounded-lg px-2 py-0.5 text-xs font-medium ${
                    puzzle.pangrams.includes(word)
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-accent-400'
                      : 'bg-surface-200 text-surface-500 dark:bg-surface-800 dark:text-surface-400'
                  }`}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Geri sayim */}
        <div className="mb-5 text-center">
          <div className="text-xs font-medium text-surface-400">
            Yarinki bulmaca:
          </div>
          <div className="mt-0.5 font-mono text-lg font-bold text-surface-700 dark:text-surface-300">
            {pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)}
          </div>
        </div>

        {/* Paylas butonu */}
        <div className="flex justify-center">
          <ShareButton
            puzzle={puzzle}
            foundWords={foundWords}
            score={score}
            maxScore={maxScore}
            onMessage={onMessage}
          />
        </div>
      </div>
    </div>
  )
}
