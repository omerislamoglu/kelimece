import { useState, useEffect } from 'react'
import { BarChart3, Flag, HelpCircle, Settings as SettingsIcon } from 'lucide-react'
import { useGame } from './hooks/useGame'
import { useTheme } from './hooks/useTheme'
import LetterGrid from './components/LetterGrid'
import InputDisplay from './components/InputDisplay'
import Controls from './components/Controls'
import ScoreBar from './components/ScoreBar'
import FoundWords from './components/FoundWords'
import Toast from './components/Toast'
import ShareButton from './components/ShareButton'
import GameComplete from './components/GameComplete'
import StatsPanel from './components/StatsPanel'
import Settings from './components/Settings'
import Skeleton from './components/Skeleton'
import Tutorial, { isTutorialCompleted, resetTutorial } from './components/Tutorial'

function formatTurkishDate(dateStr: string): string {
  const months = [
    'Ocak', 'Subat', 'Mart', 'Nisan', 'Mayis', 'Haziran',
    'Temmuz', 'Agustos', 'Eylul', 'Ekim', 'Kasim', 'Aralik',
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
    inputFeedback,
    scoreBump,
    addLetter,
    removeLetter,
    shuffleLetters,
    submitWord,
    showMessage,
    endGame,
    setGameComplete,
  } = useGame()

  const { theme, setTheme } = useTheme()

  const [showStats, setShowStats] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (!isTutorialCompleted()) {
      setShowTutorial(true)
    }
  }, [])

  function handleShowTutorial() {
    resetTutorial()
    setShowTutorial(true)
  }

  if (!puzzle) return <Skeleton />

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col bg-surface-50 dark:bg-surface-950 sm:my-4 sm:min-h-0 sm:rounded-3xl sm:shadow-xl sm:shadow-surface-900/5 dark:sm:shadow-black/20">
      <Toast message={message} />

      {/* Header */}
      <header className="px-5 pt-5 pb-3">
        <div className="mb-1 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">
            Kelimece
          </h1>
          <div className="flex items-center gap-1">
            <span className="mr-1 text-xs font-medium text-surface-400">
              {formatTurkishDate(puzzle.date)}
            </span>
            <button
              onClick={handleShowTutorial}
              aria-label="Nasil oynanir"
              className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowStats(true)}
              aria-label="Istatistikler"
              className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
            >
              <BarChart3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              aria-label="Ayarlar"
              className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
            >
              <SettingsIcon className="h-5 w-5" />
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
        <ScoreBar score={score} maxScore={maxScore} scoreBump={scoreBump} />
      </header>

      {/* Bulunan kelimeler toggle */}
      <div className="px-5 pb-2">
        <FoundWords
          foundWords={foundWords}
          totalWords={puzzle.validWords.length}
          pangrams={puzzle.pangrams}
        />
      </div>

      {/* Oyun alani */}
      <main className="flex flex-1 flex-col items-center justify-center gap-5 px-5 pb-8 pt-2">
        <InputDisplay
          currentInput={currentInput}
          centerLetter={puzzle.centerLetter}
          feedback={inputFeedback}
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

        {/* Bugunu Bitir butonu */}
        {!finished && foundWords.length > 0 && (
          <button
            onClick={endGame}
            aria-label="Bugunu bitir"
            className="inline-flex items-center gap-2 rounded-xl border border-surface-300 px-4 py-2 text-sm font-medium text-surface-500 transition-colors hover:border-surface-400 hover:text-surface-700 dark:border-surface-700 dark:text-surface-400 dark:hover:border-surface-500 dark:hover:text-surface-300"
          >
            <Flag className="h-4 w-4" />
            Bugunu Bitir
          </button>
        )}

        {/* Bitmis oyun icin tekrar goster */}
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

      {showSettings && (
        <Settings
          theme={theme}
          onThemeChange={setTheme}
          onShowTutorial={handleShowTutorial}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showTutorial && <Tutorial onComplete={() => setShowTutorial(false)} />}
    </div>
  )
}

export default App
