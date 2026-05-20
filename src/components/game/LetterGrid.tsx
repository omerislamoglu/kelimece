import { memo, useState, useMemo, useCallback } from 'react'
import { playLetterTap, vibrate } from '../../lib/sounds'

interface LetterGridProps {
  letters: string[]
  currentInput: string
  onLetterClick: (letter: string) => void
}

const ANGLES = [0, 60, 120, 180, 240, 300]

const LetterButton = memo(function LetterButton({
  letter,
  isCenter,
  disabled,
  onClick,
  style,
}: {
  letter: string
  isCenter: boolean
  disabled: boolean
  onClick: () => void
  style?: React.CSSProperties
}) {
  const [pressed, setPressed] = useState(false)

  const handleClick = useCallback(() => {
    if (disabled) return
    setPressed(true)
    playLetterTap()
    vibrate(10)
    onClick()
    setTimeout(() => setPressed(false), 150)
  }, [disabled, onClick])

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={`Harf ${letter.toLocaleUpperCase('tr-TR')}${isCenter ? ' (merkez)' : ''}`}
      className={`
        absolute flex items-center justify-center rounded-2xl
        font-extrabold uppercase select-none
        transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]
        focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none
        ${pressed ? 'animate-button-bounce' : ''}
        ${disabled ? 'opacity-25 cursor-default' : 'cursor-pointer active:scale-90'}
        ${
          isCenter
            ? 'h-[4.5rem] w-[4.5rem] text-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-xl shadow-primary-600/40 dark:from-accent-400 dark:to-accent-500 dark:text-surface-900 dark:shadow-accent-500/30'
            : 'h-[3.75rem] w-[3.75rem] text-xl bg-primary-50 text-surface-800 shadow-lg shadow-primary-500/10 hover:shadow-xl hover:-translate-y-0.5 hover:bg-primary-100 dark:bg-surface-800 dark:text-surface-100 dark:shadow-surface-900/60 dark:hover:bg-surface-700'
        }
      `}
      style={style}
    >
      {letter}
    </button>
  )
})

export default memo(function LetterGrid({
  letters,
  currentInput,
  onLetterClick,
}: LetterGridProps) {
  const radius = 76

  const usedCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const ch of currentInput) {
      counts.set(ch, (counts.get(ch) ?? 0) + 1)
    }
    return counts
  }, [currentInput])

  const availableCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const ch of letters) {
      counts.set(ch, (counts.get(ch) ?? 0) + 1)
    }
    return counts
  }, [letters])

  const isLetterDisabled = useCallback(
    (letter: string): boolean => {
      const used = usedCounts.get(letter) ?? 0
      const available = availableCounts.get(letter) ?? 0
      return used >= available
    },
    [availableCounts, usedCounts],
  )

  const handleCenterClick = useCallback(() => {
    onLetterClick(letters[0])
  }, [letters, onLetterClick])

  return (
    <div
      className="relative mx-auto"
      style={{ width: '250px', height: '250px' }}
      role="group"
      aria-label="Harf gridi"
    >
      {/* Center letter — always the centerLetter */}
      <LetterButton
        letter={letters[0]}
        isCenter
        disabled={isLetterDisabled(letters[0])}
        onClick={handleCenterClick}
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
            key={`${letter}-${i}`}
            letter={letter}
            isCenter={false}
            disabled={isLetterDisabled(letter)}
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
})
