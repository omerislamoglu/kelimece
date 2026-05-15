import { useGame } from './hooks/useGame'
import LetterGrid from './components/LetterGrid'
import InputDisplay from './components/InputDisplay'
import Controls from './components/Controls'
import ScoreBar from './components/ScoreBar'
import FoundWords from './components/FoundWords'
import Toast from './components/Toast'
import ShareButton from './components/ShareButton'

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
    addLetter,
    removeLetter,
    shuffleLetters,
    submitWord,
    showMessage,
  } = useGame()

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
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-surface-400">
              {formatTurkishDate(puzzle.date)}
            </span>
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
      </main>
    </div>
  )
}

export default App
