import { useGame } from './hooks/useGame'
import Hive from './components/Hive'
import InputDisplay from './components/InputDisplay'
import Controls from './components/Controls'

function App() {
  const {
    puzzle,
    currentInput,
    message,
    addLetter,
    removeLetter,
    shuffleLetters,
    submitWord,
  } = useGame()

  if (!puzzle) return null

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4">
      <h1 className="text-3xl font-bold text-gray-900">Kelimece</h1>

      {message && (
        <div
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : message.type === 'error'
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
          }`}
        >
          {message.text}
        </div>
      )}

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
  )
}

export default App
