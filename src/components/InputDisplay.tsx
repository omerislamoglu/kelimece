interface InputDisplayProps {
  currentInput: string
  centerLetter: string
}

export default function InputDisplay({
  currentInput,
  centerLetter,
}: InputDisplayProps) {
  return (
    <div className="flex min-h-[3.5rem] items-center justify-center border-b-2 border-surface-200 px-2 pb-1 dark:border-surface-700">
      {currentInput.length === 0 ? (
        <span className="inline-block h-8 w-[2px] animate-blink bg-primary-600 dark:bg-accent-500" />
      ) : (
        <div className="flex items-center">
          {[...currentInput].map((letter, i) => (
            <span
              key={i}
              className={`animate-letter-pop text-[clamp(1.75rem,6vw,2.5rem)] font-bold uppercase tracking-wide ${
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
}
