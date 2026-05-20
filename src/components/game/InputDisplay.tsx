import { memo, useRef, useEffect, useState } from 'react'
import type { InputFeedback } from '../../hooks/useGame'

interface InputDisplayProps {
  currentInput: string
  centerLetter: string
  feedback?: InputFeedback
}

export default memo(function InputDisplay({
  currentInput,
  centerLetter,
  feedback,
}: InputDisplayProps) {
  const prevLengthRef = useRef(currentInput.length)
  const [animatingIdx, setAnimatingIdx] = useState<number | null>(null)

  useEffect(() => {
    const prevLen = prevLengthRef.current
    const curLen = currentInput.length
    prevLengthRef.current = curLen

    if (curLen > prevLen) {
      // New letter added — animate it
      setAnimatingIdx(curLen - 1)
      const t = setTimeout(() => setAnimatingIdx(null), 150)
      return () => clearTimeout(t)
    }
    return undefined
  }, [currentInput])

  const feedbackClass =
    feedback === 'error'
      ? 'animate-shake animate-flash-error'
      : feedback === 'warning'
        ? 'animate-flash-warning'
        : feedback === 'info'
          ? 'animate-border-pulse'
          : feedback === 'success' ||
              feedback === 'pangram' ||
              feedback === 'bonus'
            ? 'animate-flash-success animate-slide-out-up'
            : ''

  return (
    <div
      className={`flex min-h-[3.5rem] items-center justify-center rounded-xl border-b-2 border-surface-200 px-2 pb-1 transition-colors duration-150 dark:border-surface-700 ${feedbackClass}`}
      role="status"
      aria-live="polite"
      aria-label={
        currentInput ? `Girilen harfler: ${currentInput}` : 'Harf giriniz'
      }
    >
      {currentInput.length === 0 ? (
        <span className="inline-block h-8 w-[2px] animate-blink bg-primary-600 dark:bg-accent-500" />
      ) : (
        <div className="flex items-center">
          {[...currentInput].map((letter, i) => (
            <span
              key={i}
              className={`text-[clamp(1.75rem,6vw,2.5rem)] font-bold uppercase tracking-wide ${
                animatingIdx === i ? 'animate-letter-slide-in' : ''
              } ${
                letter === centerLetter
                  ? 'text-primary-600 dark:text-accent-400'
                  : 'text-surface-900 dark:text-surface-100'
              }`}
            >
              {letter}
            </span>
          ))}
          <span className="ml-0.5 inline-block h-8 w-[2px] animate-blink bg-primary-600 dark:bg-accent-500" />
        </div>
      )}
    </div>
  )
})
