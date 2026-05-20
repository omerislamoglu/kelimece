import { useState, useMemo, useRef, useEffect, memo } from 'react'
import { ChevronDown, X } from 'lucide-react'
import WordDefinition from './WordDefinition'

interface FoundWordsProps {
  foundWords: string[]
  bonusWords: string[]
  totalWords: number
  pangrams: string[]
}

export default memo(function FoundWords({
  foundWords,
  bonusWords,
  totalWords,
  pangrams,
}: FoundWordsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)

  // Track which word was just added to animate it
  const prevCountRef = useRef(foundWords.length)
  const prevBonusCountRef = useRef(bonusWords.length)
  const [newWord, setNewWord] = useState<string | null>(null)

  useEffect(() => {
    if (foundWords.length > prevCountRef.current) {
      const latest = foundWords[foundWords.length - 1]
      setNewWord(latest)
      const t = setTimeout(() => setNewWord(null), 350)
      prevCountRef.current = foundWords.length
      return () => clearTimeout(t)
    }
    prevCountRef.current = foundWords.length
  }, [foundWords])

  useEffect(() => {
    if (bonusWords.length > prevBonusCountRef.current) {
      const latest = bonusWords[bonusWords.length - 1]
      setNewWord(latest)
      const t = setTimeout(() => setNewWord(null), 350)
      prevBonusCountRef.current = bonusWords.length
      return () => clearTimeout(t)
    }
    prevBonusCountRef.current = bonusWords.length
  }, [bonusWords])

  const sortedWords = useMemo(
    () => [...foundWords].sort((a, b) => a.localeCompare(b, 'tr')),
    [foundWords],
  )

  const sortedBonus = useMemo(
    () => [...bonusWords].sort((a, b) => a.localeCompare(b, 'tr')),
    [bonusWords],
  )

  const pangramSet = useMemo(() => new Set(pangrams), [pangrams])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={`${foundWords.length} / ${totalWords} kelime, bulunan kelimeleri aç`}
        className="flex w-full items-center justify-between rounded-2xl
                   border border-surface-200 bg-primary-50/60 px-4 py-3
                   text-left backdrop-blur-sm transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]
                   hover:bg-primary-50 hover:shadow-sm
                   dark:border-surface-700 dark:bg-surface-800/80
                   dark:hover:bg-surface-800"
      >
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-surface-900 dark:text-surface-100">
            {foundWords.length}
          </span>
          <span className="text-sm font-medium text-surface-400">
            / {totalWords} kelime
          </span>
          {bonusWords.length > 0 && (
            <span className="text-xs font-medium text-yellow-500">
              +{bonusWords.length} bonus
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-5 w-5 text-surface-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Mobil overlay */}
          <div
            className="animate-fade-in fixed inset-0 z-40 bg-surface-900/30 backdrop-blur-sm sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Bottom sheet (mobil) / Dropdown (masaustu) */}
          <div
            className="fixed inset-x-0 bottom-0 z-50 max-h-[65vh] animate-slide-up overflow-hidden
                       rounded-t-3xl bg-surface-50 shadow-2xl
                       sm:static sm:z-auto sm:mt-2 sm:max-h-56 sm:animate-fade-in
                       sm:rounded-2xl sm:border sm:border-surface-200 sm:shadow-sm
                       dark:bg-surface-900 dark:sm:border-surface-700"
          >
            {/* Mobil handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-surface-300 dark:bg-surface-700" />
            </div>

            <div className="flex items-center justify-between border-b border-surface-200 px-5 py-3 dark:border-surface-700">
              <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                Bulunan Kelimeler
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Kelime listesini kapat"
                className="rounded-full p-2 text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-700 dark:hover:bg-surface-700 dark:hover:text-surface-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              className="overflow-y-auto px-5 py-3"
              style={{ maxHeight: 'calc(65vh - 90px)' }}
            >
              {sortedWords.length === 0 && sortedBonus.length === 0 ? (
                <p className="py-6 text-center text-sm text-surface-400">
                  Henuz kelime bulunamadi
                </p>
              ) : (
                <>
                  {/* Target words */}
                  {sortedWords.length > 0 && (
                    <div className="flex flex-wrap gap-2 pb-2">
                      {sortedWords.map((word) => {
                        const isPangram = pangramSet.has(word)
                        const isNew = word === newWord
                        return (
                          <button
                            key={word}
                            type="button"
                            onClick={() => setSelectedWord(word)}
                            aria-label={`${word} tanımını aç`}
                            className={`inline-block cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:underline active:scale-95 ${
                              isNew ? 'animate-word-slide-in' : ''
                            } ${
                              isPangram
                                ? 'animate-pangram-glow bg-primary-600/10 text-primary-600 ring-1 ring-primary-500/30 hover:bg-primary-600/20 dark:bg-accent-500/10 dark:text-accent-400 dark:ring-accent-500/30 dark:hover:bg-accent-500/20'
                                : 'bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700'
                            }`}
                          >
                            {word}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Bonus words */}
                  {sortedBonus.length > 0 && (
                    <>
                      <div className="my-2 flex items-center gap-2">
                        <div className="h-px flex-1 bg-surface-200 dark:bg-surface-700" />
                        <span className="text-xs font-medium text-yellow-500">
                          Bonus
                        </span>
                        <div className="h-px flex-1 bg-surface-200 dark:bg-surface-700" />
                      </div>
                      <div className="flex flex-wrap gap-2 pb-2">
                        {sortedBonus.map((word) => (
                          <button
                            key={word}
                            type="button"
                            onClick={() => setSelectedWord(word)}
                            aria-label={`${word} bonus kelimesinin tanımını aç`}
                            className={`inline-block cursor-pointer rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-semibold text-yellow-600 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-yellow-500/20 hover:underline active:scale-95 dark:text-yellow-400 ${
                              word === newWord ? 'animate-word-slide-in' : ''
                            }`}
                          >
                            {word}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {selectedWord && (
        <WordDefinition
          key={selectedWord}
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </>
  )
})
