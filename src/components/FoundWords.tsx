import { useState, useMemo } from 'react'

interface FoundWordsProps {
  foundWords: string[]
  totalWords: number
  pangrams: string[]
}

export default function FoundWords({
  foundWords,
  totalWords,
  pangrams,
}: FoundWordsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const sortedWords = useMemo(
    () => [...foundWords].sort((a, b) => a.localeCompare(b, 'tr')),
    [foundWords],
  )

  const pangramSet = useMemo(() => new Set(pangrams), [pangrams])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-2xl
                   border border-cream-200 bg-white/80 px-4 py-3
                   text-left backdrop-blur-sm transition-all duration-200
                   hover:bg-white hover:shadow-sm"
      >
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-bark-800">
            {foundWords.length}
          </span>
          <span className="text-sm font-medium text-bark-600/50">
            / {totalWords} kelime
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-5 w-5 text-bark-600/40 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Mobil overlay */}
          <div
            className="animate-fade-in fixed inset-0 z-40 bg-bark-900/30 backdrop-blur-sm sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Bottom sheet (mobil) / Dropdown (masaüstü) */}
          <div
            className="fixed inset-x-0 bottom-0 z-50 max-h-[65vh] animate-slide-up overflow-hidden
                       rounded-t-3xl bg-cream-50 shadow-2xl
                       sm:static sm:z-auto sm:mt-2 sm:max-h-56 sm:animate-fade-in
                       sm:rounded-2xl sm:border sm:border-cream-200 sm:shadow-sm"
          >
            {/* Mobil handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-cream-300" />
            </div>

            <div className="flex items-center justify-between border-b border-cream-200 px-5 py-3">
              <span className="text-sm font-semibold text-bark-700">
                Bulunan Kelimeler
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-bark-600/40 transition-colors hover:bg-cream-200 hover:text-bark-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>

            <div
              className="overflow-y-auto px-5 py-3"
              style={{ maxHeight: 'calc(65vh - 90px)' }}
            >
              {sortedWords.length === 0 ? (
                <p className="py-6 text-center text-sm text-bark-600/40">
                  Henüz kelime bulunamadı
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 pb-2">
                  {sortedWords.map((word) => (
                    <span
                      key={word}
                      className={`animate-fade-in inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                        pangramSet.has(word)
                          ? 'bg-honey-400/20 text-honey-600 ring-1 ring-honey-400/40'
                          : 'bg-cream-200/80 text-bark-700'
                      }`}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
