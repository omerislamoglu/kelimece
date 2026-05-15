import { useState } from 'react'

interface LetterGridProps {
  letters: string[]
  centerLetter: string
  onLetterClick: (letter: string) => void
}

const ANGLES = [0, 60, 120, 180, 240, 300]

function LetterButton({
  letter,
  isCenter,
  onClick,
  style,
}: {
  letter: string
  isCenter: boolean
  onClick: () => void
  style?: React.CSSProperties
}) {
  const [pressed, setPressed] = useState(false)

  function handleClick() {
    setPressed(true)
    onClick()
    setTimeout(() => setPressed(false), 150)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Harf ${letter.toUpperCase()}${isCenter ? ' (merkez)' : ''}`}
      className={`
        absolute flex items-center justify-center rounded-full
        font-bold uppercase select-none cursor-pointer
        transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none
        ${pressed ? 'scale-90' : 'scale-100'}
        ${
          isCenter
            ? 'w-20 h-20 text-2xl bg-primary-600 text-white shadow-lg shadow-primary-600/30 hover:bg-primary-700 dark:bg-accent-500 dark:hover:bg-accent-400 dark:shadow-accent-500/30'
            : 'w-16 h-16 text-xl bg-white text-surface-800 shadow-md shadow-surface-200/60 hover:bg-surface-100 dark:bg-surface-800 dark:text-surface-100 dark:shadow-surface-900/40 dark:hover:bg-surface-700'
        }
      `}
      style={style}
    >
      {letter}
    </button>
  )
}

export default function LetterGrid({
  letters,
  centerLetter,
  onLetterClick,
}: LetterGridProps) {
  const radius = 72

  return (
    <div
      className="relative mx-auto"
      style={{ width: '240px', height: '240px' }}
      role="group"
      aria-label="Harf griди"
    >
      {/* Center letter */}
      <LetterButton
        letter={letters[0]}
        isCenter={letters[0] === centerLetter}
        onClick={() => onLetterClick(letters[0])}
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Surrounding letters */}
      {letters.slice(1).map((letter, i) => {
        const angle = (ANGLES[i] - 90) * (Math.PI / 180)
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius

        return (
          <LetterButton
            key={letter}
            letter={letter}
            isCenter={letter === centerLetter}
            onClick={() => onLetterClick(letter)}
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )
      })}
    </div>
  )
}
