import { useState, lazy, Suspense } from 'react'
import { Coins, Lightbulb, Settings as SettingsIcon, Star } from 'lucide-react'
import { useGame } from './hooks/useGame'
import { useTheme } from './hooks/useTheme'
import LetterGrid from './components/game/LetterGrid'
import InputDisplay from './components/game/InputDisplay'
import Controls from './components/game/Controls'
import FoundWords from './components/game/FoundWords'
import HintsPanel from './components/game/HintsPanel'
import Toast from './components/ui/Toast'
import Skeleton from './components/ui/Skeleton'
import { isTutorialCompleted, resetTutorial } from './lib/tutorial'
import { HINT_COST } from './lib/constants'

const LevelComplete = lazy(() => import('./components/screens/LevelComplete'))
const StatsPanel = lazy(() => import('./components/screens/StatsPanel'))
const Settings = lazy(() => import('./components/screens/Settings'))
const Tutorial = lazy(() => import('./components/screens/Tutorial'))
const CoinShop = lazy(() => import('./components/screens/CoinShop'))
const LevelMap = lazy(() => import('./components/screens/LevelMap'))

function App() {
  const {
    puzzle,
    foundWords,
    bonusWords,
    currentInput,
    score,
    coins,
    message,
    levelComplete,
    inputFeedback,
    scoreBump,
    progress,
    addLetter,
    removeLetter,
    clearInput,
    shuffleLetters,
    submitWord,
    useHint,
    addCoins,
    goToLevel,
    nextLevel,
    setLevelComplete,
  } = useGame()

  const { theme, setTheme } = useTheme()

  const [showStats, setShowStats] = useState(false)
  const [showTutorial, setShowTutorial] = useState(() => !isTutorialCompleted())
  const [showSettings, setShowSettings] = useState(false)
  const [showHints, setShowHints] = useState(false)
  const [showShop, setShowShop] = useState(false)
  const [showMap, setShowMap] = useState(false)

  function handleShowTutorial() {
    resetTutorial()
    setShowTutorial(true)
  }

  if (!puzzle) return <Skeleton />

  const targetProgress = Math.min(foundWords.length / puzzle.targetWordCount, 1)
  const unfoundCount = puzzle.validWords.length - foundWords.length

  return (
    <div
      className="mx-auto flex min-h-[100dvh] max-w-lg flex-col bg-surface-50 dark:bg-surface-950 sm:my-4 sm:min-h-0 sm:rounded-3xl sm:shadow-xl sm:shadow-surface-900/5 dark:sm:shadow-black/20"
      style={{
        paddingTop: 'var(--safe-area-top)',
        paddingBottom: 'var(--safe-area-bottom)',
      }}
    >
      <Toast message={message} />

      {/* Header */}
      <header className="px-5 pt-5 pb-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">
              Kelimece
            </h1>
            <button
              onClick={() => setShowMap(true)}
              className="rounded-lg bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-700 transition-colors hover:bg-primary-600/20 dark:bg-accent-500/20 dark:text-accent-400 dark:hover:bg-accent-500/30"
            >
              Bolum {puzzle.level}
            </button>
          </div>
          <div className="flex items-center gap-2">
            {/* Jeton */}
            <button
              onClick={() => setShowShop(true)}
              aria-label="Jeton magazasi"
              className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2.5 py-1 transition-colors hover:bg-yellow-500/20"
            >
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">
                {coins}
              </span>
            </button>
            {/* Yildiz */}
            <div className="flex items-center gap-1 rounded-full bg-surface-100 px-2.5 py-1 dark:bg-surface-800">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-surface-600 dark:text-surface-300">
                {progress.totalStars}
              </span>
            </div>
            {/* Ayarlar */}
            <button
              onClick={() => setShowSettings(true)}
              aria-label="Ayarlar"
              className="rounded-full p-1.5 text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
            >
              <SettingsIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Bolum ilerleme cubugu */}
        <div className="flex items-center gap-2">
          <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-surface-200 dark:bg-surface-800">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out ${
                scoreBump ? 'animate-score-bump' : ''
              } ${
                targetProgress >= 1
                  ? 'bg-success-500'
                  : 'bg-primary-500 dark:bg-accent-500'
              }`}
              style={{ width: `${targetProgress * 100}%` }}
            />
          </div>
          <span className="text-sm font-bold text-surface-600 dark:text-surface-300">
            {foundWords.length}/{puzzle.targetWordCount}
          </span>
          <button
            onClick={() => setShowHints(!showHints)}
            aria-label="Ipuclari"
            className={`rounded-full p-1.5 transition-colors ${
              showHints
                ? 'bg-primary-100 text-primary-600 dark:bg-accent-500/20 dark:text-accent-400'
                : 'text-surface-400 hover:bg-surface-200 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300'
            }`}
          >
            <Lightbulb className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Bulunan kelimeler toggle */}
      <div className="px-5 pb-2">
        <FoundWords
          foundWords={foundWords}
          bonusWords={bonusWords}
          totalWords={puzzle.targetWordCount}
          pangrams={puzzle.pangrams}
        />
      </div>

      {/* Ipucu paneli */}
      {showHints && (
        <div className="animate-fade-in mx-5 mb-2 rounded-2xl border border-surface-200 bg-primary-50/80 p-4 backdrop-blur-sm dark:border-surface-700 dark:bg-surface-800/80">
          <h3 className="mb-3 text-center text-sm font-semibold text-surface-700 dark:text-surface-300">
            Ipuclari
          </h3>
          <HintsPanel validWords={puzzle.validWords} foundWords={foundWords} />

          {/* Hint purchase button */}
          {unfoundCount > 0 && (
            <div className="mt-3 space-y-2">
              <button
                onClick={useHint}
                disabled={coins < HINT_COST}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500/10 px-4 py-2.5 text-sm font-semibold text-yellow-600 transition-all hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-40 dark:text-yellow-400"
              >
                <Lightbulb className="h-4 w-4" />
                Kelime Ac ({HINT_COST} jeton)
              </button>
              {coins < HINT_COST && (
                <button
                  onClick={() => {
                    setShowHints(false)
                    setShowShop(true)
                  }}
                  className="flex w-full items-center justify-center gap-1 text-xs font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-accent-400 dark:hover:text-accent-300"
                >
                  <Coins className="h-3.5 w-3.5" />
                  Jeton Satin Al
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Oyun alani */}
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

      {/* Modallar */}
      <Suspense fallback={null}>
        {levelComplete && (
          <LevelComplete
            puzzle={puzzle}
            foundWords={foundWords}
            score={score}
            onNextLevel={nextLevel}
            onClose={() => setLevelComplete(false)}
          />
        )}

        {showStats && <StatsPanel onClose={() => setShowStats(false)} />}

        {showSettings && (
          <Settings
            theme={theme}
            onThemeChange={setTheme}
            onShowTutorial={handleShowTutorial}
            onShowStats={() => setShowStats(true)}
            onClose={() => setShowSettings(false)}
          />
        )}

        {showTutorial && <Tutorial onComplete={() => setShowTutorial(false)} />}

        {showShop && (
          <CoinShop
            coins={coins}
            onPurchase={addCoins}
            onClose={() => setShowShop(false)}
          />
        )}

        {showMap && (
          <LevelMap
            progress={progress}
            currentLevel={puzzle.level}
            onSelectLevel={goToLevel}
            onClose={() => setShowMap(false)}
          />
        )}
      </Suspense>
    </div>
  )
}

export default App
