import { useState, useEffect } from 'react'
import { BarChart3, Flag, HelpCircle } from 'lucide-react'
import { useGame } from './hooks/useGame'
import LetterGrid from './components/LetterGrid'
import InputDisplay from './components/InputDisplay'
import Controls from './components/Controls'
import ScoreBar from './components/ScoreBar'
import FoundWords from './components/FoundWords'
import Toast from './components/Toast'
import ShareButton from './components/ShareButton'
import GameComplete from './components/GameComplete'
import StatsPanel from './components/StatsPanel'
import Tutorial, { isTutorialCompleted, resetTutorial } from './components/Tutorial'

function formatTurkishDate(dateStr: string): string {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ]
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${d} ${months[m - 1]} ${y}`
}

function App() {
  const {
    puzzle,
    foundWords,
    currentInput,
    score,
    maxScore,
    message,
    gameComplete,
    finished,
    addLetter,
    removeLetter,
    shuffleLetters,
    submitWord,
    showMessage,
    endGame,
    setGameComplete,
  } = useGame()

  const [showStats, setShowStats] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    if (!isTutorialCompleted()) {
      setShowTutorial(true)
    }
  }, [])

  function handleShowTutorial() {
    resetTutorial()
    setShowTutorial(true)
  }

  if (!puzzle) return null

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col bg-surface-50 dark:bg-surface-950 sm:my-4 sm:min-h-0 sm:rounded-3xl sm:shadow-xl sm:shadow-surface-900/5 dark:sm:shadow-black/20">
      <Toast message={message} />

      {/* Header */}
      <header className="px-5 pt-5 pb-3">
        <div className="mb-1 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">
            Kelimece
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-surface-400">
              {formatTurkishDate(puzzle.date)}
            </span>
            <button
              onClick={handleShowTutorial}
              className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowStats(true)}
              className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
            >
              <BarChart3 className="h-5 w-5" />
            </button>
            <ShareButton
              puzzle={puzzle}
              foundWords={foundWords}
              score={score}
              maxScore={maxScore}
              onMessage={showMessage}
            />
          </div>
        </div>
        <ScoreBar score={score} maxScore={maxScore} />
      </header>

      {/* Bulunan kelimeler toggle */}
      <div className="px-5 pb-2">
        <FoundWords
          foundWords={foundWords}
          totalWords={puzzle.validWords.length}
          pangrams={puzzle.pangrams}
        />
      </div>

      {/* Oyun alanı */}
      <main className="flex flex-1 flex-col items-center justify-center gap-5 px-5 pb-8 pt-2">
        <InputDisplay
          currentInput={currentInput}
          centerLetter={puzzle.centerLetter}
        />

        <LetterGrid
          letters={puzzle.letters}
          centerLetter={puzzle.centerLetter}
          onLetterClick={addLetter}
        />

        <Controls
          letters={puzzle.letters}
          onLetterClick={addLetter}
          onDelete={removeLetter}
          onShuffle={shuffleLetters}
          onSubmit={submitWord}
        />

        {/* Bugünü Bitir butonu */}
        {!finished && foundWords.length > 0 && (
          <button
            onClick={endGame}
            className="inline-flex items-center gap-2 rounded-xl border border-surface-300 px-4 py-2 text-sm font-medium text-surface-500 transition-colors hover:border-surface-400 hover:text-surface-700 dark:border-surface-700 dark:text-surface-400 dark:hover:border-surface-500 dark:hover:text-surface-300"
          >
            <Flag className="h-4 w-4" />
            Bugunu Bitir
          </button>
        )}

        {/* Bitmiş oyun için tekrar göster */}
        {finished && !gameComplete && (
          <button
            onClick={() => setGameComplete(true)}
            className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-accent-400 dark:hover:text-accent-300"
          >
            Sonuclari Gor
          </button>
        )}
      </main>

      {/* Modallar */}
      {gameComplete && (
        <GameComplete
          puzzle={puzzle}
          foundWords={foundWords}
          score={score}
          maxScore={maxScore}
          onClose={() => setGameComplete(false)}
          onMessage={showMessage}
        />
      )}

      {showStats && <StatsPanel onClose={() => setShowStats(false)} />}

      {showTutorial && <Tutorial onComplete={() => setShowTutorial(false)} />}
    </div>
  )
}

export default App
