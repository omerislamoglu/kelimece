import { useMemo, memo } from 'react'

interface HintsPanelProps {
  validWords: string[]
  foundWords: string[]
}

interface LetterHint {
  letter: string
  total: number
  found: number
}

interface LengthHint {
  length: number
  total: number
  found: number
}

export default memo(function HintsPanel({
  validWords,
  foundWords,
}: HintsPanelProps) {
  const { byLetter, byLength } = useMemo(() => {
    const letterMap = new Map<string, { total: number; found: number }>()
    const lengthMap = new Map<number, { total: number; found: number }>()

    for (const word of validWords) {
      const letter = word[0].toUpperCase()
      const len = word.length

      if (!letterMap.has(letter)) letterMap.set(letter, { total: 0, found: 0 })
      letterMap.get(letter)!.total++

      if (!lengthMap.has(len)) lengthMap.set(len, { total: 0, found: 0 })
      lengthMap.get(len)!.total++
    }

    for (const word of foundWords) {
      const letter = word[0].toUpperCase()
      const len = word.length
      letterMap.get(letter)!.found++
      lengthMap.get(len)!.found++
    }

    const bl: LetterHint[] = [...letterMap.entries()]
      .map(([letter, v]) => ({ letter, ...v }))
      .sort((a, b) => a.letter.localeCompare(b.letter, 'tr'))

    const blen: LengthHint[] = [...lengthMap.entries()]
      .map(([length, v]) => ({ length, ...v }))
      .sort((a, b) => a.length - b.length)

    return { byLetter: bl, byLength: blen }
  }, [validWords, foundWords])

  return (
    <div className="space-y-4">
      {/* Bas harfe gore */}
      <div>
        <p className="mb-2 text-xs font-medium text-surface-400">
          Bas harfe gore
        </p>
        <div className="flex flex-wrap gap-1.5">
          {byLetter.map(({ letter, total, found }) => {
            const remaining = total - found
            const done = remaining === 0
            return (
              <div
                key={letter}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
                  done
                    ? 'bg-success-500/10 text-success-500 line-through'
                    : 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300'
                }`}
              >
                <span className="font-bold text-primary-600 dark:text-accent-400">
                  {letter}
                </span>
                <span>{done ? '\u2713' : remaining}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Uzunluga gore */}
      <div>
        <p className="mb-2 text-xs font-medium text-surface-400">
          Kelime uzunluguna gore
        </p>
        <div className="space-y-1.5">
          {byLength.map(({ length, total, found }) => {
            const remaining = total - found
            const done = remaining === 0
            const pct = total > 0 ? (found / total) * 100 : 0
            return (
              <div key={length} className="flex items-center gap-2">
                <span className="w-16 text-xs font-medium text-surface-500 dark:text-surface-400">
                  {length} harfli
                </span>
                <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-primary-500/20 transition-all duration-300 dark:bg-accent-500/20"
                    style={{ width: `${pct}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className={`text-[11px] font-bold ${
                        done
                          ? 'text-success-500'
                          : 'text-surface-600 dark:text-surface-300'
                      }`}
                    >
                      {done ? '\u2713' : `${found} / ${total}`}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
})
