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
      {/* Toggle butonu */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full max-w-sm items-center justify-between rounded-xl border border-gray-200
                   bg-white px-4 py-3 text-left shadow-sm transition-colors hover:bg-gray-50"
      >
        <span className="text-sm font-medium text-gray-700">
          {foundWords.length}{' '}
          <span className="text-gray-400">/ {totalWords} kelime</span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
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

      {/* Overlay + Bottom Sheet (mobil) / Dropdown (desktop) */}
      {isOpen && (
        <>
          {/* Mobil overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/30 sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div
            className="fixed inset-x-0 bottom-0 z-50 max-h-[60vh] overflow-hidden rounded-t-2xl
                       bg-white shadow-xl sm:static sm:z-auto sm:mt-2 sm:max-h-64 sm:w-full
                       sm:max-w-sm sm:rounded-xl sm:border sm:border-gray-200 sm:shadow-sm"
          >
            {/* Mobil handle */}
            <div className="flex justify-center py-2 sm:hidden">
              <div className="h-1 w-8 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
              <span className="text-sm font-medium text-gray-600">
                Bulunan Kelimeler
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>

            {/* Kelime listesi */}
            <div className="overflow-y-auto px-4 py-2" style={{ maxHeight: 'calc(60vh - 80px)' }}>
              {sortedWords.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">
                  Henüz kelime bulunamadı
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 pb-2">
                  {sortedWords.map((word) => (
                    <span
                      key={word}
                      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                        pangramSet.has(word)
                          ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {word}
                      {pangramSet.has(word) && (
                        <span className="ml-1 text-amber-500" aria-label="pangram">
                          *
                        </span>
                      )}
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
