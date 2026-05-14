import { useGame } from './hooks/useGame'
import Hive from './components/Hive'
import InputDisplay from './components/InputDisplay'
import Controls from './components/Controls'
import ScoreBar from './components/ScoreBar'
import FoundWords from './components/FoundWords'
import Toast from './components/Toast'

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
  } = useGame()

  if (!puzzle) return null

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 px-4 py-6">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">Kelimece</h1>

      <Toast message={message} />

      <ScoreBar score={score} maxScore={maxScore} />

      <div className="mt-4 w-full max-w-sm">
        <FoundWords
          foundWords={foundWords}
          totalWords={puzzle.validWords.length}
          pangrams={puzzle.pangrams}
        />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
        <InputDisplay
          currentInput={currentInput}
          centerLetter={puzzle.centerLetter}
        />

        <Hive
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
      </div>
    </div>
  )
}

export default App
