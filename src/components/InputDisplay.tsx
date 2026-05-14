interface InputDisplayProps {
  currentInput: string
  centerLetter: string
}

export default function InputDisplay({
  currentInput,
  centerLetter,
}: InputDisplayProps) {
  return (
    <div className="flex min-h-[3rem] items-center justify-center">
      {currentInput.length === 0 ? (
        <span className="text-2xl text-gray-300">
          <span className="inline-block w-[2px] h-7 bg-gray-400 animate-pulse" />
        </span>
      ) : (
        <div className="flex items-center">
          {[...currentInput].map((letter, i) => (
            <span
              key={i}
              className={`text-3xl sm:text-4xl font-bold uppercase tracking-wider ${
                letter === centerLetter
                  ? 'text-amber-500'
                  : 'text-gray-800'
              }`}
            >
              {letter}
            </span>
          ))}
          <span className="inline-block w-[2px] h-8 ml-0.5 bg-amber-500 animate-blink" />
        </div>
      )}
    </div>
  )
}
