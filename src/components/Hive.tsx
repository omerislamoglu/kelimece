import { useState } from 'react'

interface HiveProps {
  letters: string[]
  centerLetter: string
  onLetterClick: (letter: string) => void
}

const POSITIONS = [
  { row: 0, col: 0 },
  { row: -1, col: -0.5 },
  { row: -1, col: 0.5 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
  { row: 1, col: -0.5 },
  { row: 1, col: 0.5 },
]

function HexButton({
  letter,
  isCenter,
  onClick,
  style,
}: {
  letter: string
  isCenter: boolean
  onClick: () => void
  style: React.CSSProperties
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
      className={`
        absolute flex items-center justify-center
        w-[var(--hex-size)] h-[var(--hex-size)]
        text-[clamp(1.25rem,4vw,1.75rem)] font-bold uppercase
        select-none cursor-pointer
        transition-all duration-150
        ${pressed ? 'scale-90' : 'scale-100'}
        ${
          isCenter
            ? 'bg-honey-400 text-bark-800 hover:bg-honey-300'
            : 'bg-cream-200 text-bark-700 hover:bg-cream-300'
        }
      `}
      style={{
        ...style,
        clipPath:
          'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
      }}
    >
      {letter}
    </button>
  )
}

export default function Hive({
  letters,
  centerLetter,
  onLetterClick,
}: HiveProps) {
  return (
    <div
      className="relative mx-auto"
      style={
        {
          '--hex-size': 'clamp(60px, 16vw, 84px)',
          '--hex-gap': '4px',
          width: 'calc(var(--hex-size) * 3 + var(--hex-gap) * 2)',
          height: 'calc(var(--hex-size) * 2.5 + var(--hex-gap) * 2)',
        } as React.CSSProperties
      }
    >
      {letters.map((letter, i) => {
        const pos = POSITIONS[i]
        const left = `calc(50% + ${pos.col} * (var(--hex-size) + var(--hex-gap)) - var(--hex-size) / 2)`
        const top = `calc(50% + ${pos.row * 0.75} * (var(--hex-size) + var(--hex-gap)) - var(--hex-size) / 2)`

        return (
          <HexButton
            key={letter}
            letter={letter}
            isCenter={letter === centerLetter}
            onClick={() => onLetterClick(letter)}
            style={{ left, top }}
          />
        )
      })}
    </div>
  )
}
