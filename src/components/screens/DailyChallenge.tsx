import { useState, useEffect, useCallback } from 'react'
import { X, Flame, Trophy, Clock } from 'lucide-react'
import { useDaily } from '../../hooks/useDaily'
import {
  getDailyStats,
  formatTurkishDate,
  getToday,
  secondsUntilMidnight,
} from '../../lib/dailyPuzzle'
import LetterGrid from '../game/LetterGrid'
import InputDisplay from '../game/InputDisplay'
import Controls from '../game/Controls'
import FoundWords from '../game/FoundWords'
import Toast from '../ui/Toast'
import ShareButton from '../ShareButton'
import { useFocusTrap } from '../../hooks/useFocusTrap'

interface DailyChallengeProps {
  onClose: () => void
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function DailyChallenge({ onClose }: DailyChallengeProps) {
  const [visible, setVisible] = useState(false)
  const dialogRef = useFocusTrap<HTMLDivElement>(visible)
  const dailyStats = getDailyStats()
  const today = getToday()

  const {
    puzzle,
    foundWords,
    bonusWords,
    currentInput,
    score,
    message,
    completed,
    inputFeedback,
    scoreBump,
    addLetter,
    removeLetter,
    clearInput,
    shuffleLetters,
    submitWord,
    showMessage,
  } = useDaily()

  const [countdown, setCountdown] = useState(secondsUntilMidnight)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(secondsUntilMidnight())
    }, 1000)
    return () => clearInterval(interval)
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

  const targetProgress =
    puzzle.validWords.length > 0
      ? Math.min(foundWords.length / puzzle.validWords.length, 1)
      : 0

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col transition-all duration-200 ${
        visible ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Günün Bulmacası"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`mx-auto flex w-full max-w-lg flex-1 flex-col overflow-hidden bg-surface-50 transition-all duration-200 sm:my-4 sm:rounded-3xl dark:bg-surface-950 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <Toast message={message} />

        {/* Header */}
        <header className="px-5 pt-5 pb-3">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100">
                Günün Bulmacası
              </h2>
              <p className="text-xs text-surface-400">
                {formatTurkishDate(today)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Streak */}
              {dailyStats.streak > 0 && (
                <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                    {dailyStats.streak}
                  </span>
                </div>
              )}
              <button
                onClick={handleClose}
                aria-label="Kapat"
                className="rounded-full p-2 text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-surface-200 dark:bg-surface-800">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out ${
                  scoreBump ? 'animate-score-bump' : ''
                } ${targetProgress >= 1 ? 'bg-success-500' : 'bg-orange-500'}`}
                style={{ width: `${targetProgress * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold text-surface-600 dark:text-surface-300">
              {foundWords.length}/{puzzle.validWords.length}
            </span>
          </div>
        </header>

        {completed ? (
          /* Completion screen */
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-5 pb-8">
            <div className="text-center">
              <Trophy className="mx-auto mb-3 h-16 w-16 text-yellow-500" />
              <h3 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                Tebrikler!
              </h3>
              <p className="mt-1 text-sm text-surface-500">
                {foundWords.length === puzzle.validWords.length
                  ? 'Tüm kelimeleri buldun!'
                  : `${foundWords.length}/${puzzle.validWords.length} kelime buldun`}
              </p>
              <p className="mt-1 text-lg font-bold text-primary-600 dark:text-accent-400">
                Skor: {score}
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-orange-500">
                  {dailyStats.streak}
                </p>
                <p className="text-xs text-surface-400">Seri</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-700 dark:text-surface-300">
                  {dailyStats.totalDays}
                </p>
                <p className="text-xs text-surface-400">Toplam</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-500">
                  {dailyStats.perfectDays}
                </p>
                <p className="text-xs text-surface-400">Mükemmel</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-600 dark:text-accent-400">
                  {dailyStats.longestStreak}
                </p>
                <p className="text-xs text-surface-400">En Uzun</p>
              </div>
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-2 rounded-2xl bg-surface-100 px-5 py-3 dark:bg-surface-800">
              <Clock className="h-4 w-4 text-surface-400" />
              <div>
                <p className="text-xs text-surface-400">Yeni bulmaca:</p>
                <p className="text-lg font-bold tabular-nums text-surface-700 dark:text-surface-300">
                  {formatCountdown(countdown)}
                </p>
              </div>
            </div>

            <ShareButton
              level={0}
              foundWords={foundWords}
              totalWords={puzzle.validWords.length}
              stars={
                foundWords.length === puzzle.validWords.length
                  ? 3
                  : foundWords.length >=
                      Math.floor(puzzle.validWords.length * 0.7)
                    ? 2
                    : 1
              }
              score={score}
              onMessage={showMessage}
            />
          </div>
        ) : (
          /* Game area */
          <>
            <div className="px-5 pb-2">
              <FoundWords
                foundWords={foundWords}
                bonusWords={bonusWords}
                totalWords={puzzle.validWords.length}
                pangrams={puzzle.pangrams}
              />
            </div>

            <main className="flex flex-1 flex-col items-center justify-center gap-5 px-5 pb-8 pt-2">
              <InputDisplay
                currentInput={currentInput}
                centerLetter={puzzle.centerLetter}
                feedback={inputFeedback}
              />

              <LetterGrid
                letters={puzzle.letters}
                currentInput={currentInput}
                onLetterClick={addLetter}
              />

              <Controls
                letters={puzzle.letters}
                currentInput={currentInput}
                onLetterClick={addLetter}
                onDelete={removeLetter}
                onClear={clearInput}
                onShuffle={shuffleLetters}
                onSubmit={submitWord}
              />
            </main>
          </>
        )}
      </div>
    </div>
  )
}
