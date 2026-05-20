import { useState, useCallback } from 'react'
import { Hash, Type, Eye, Coins, Gift } from 'lucide-react'
import {
  HINT_COST_LETTER_COUNT,
  HINT_COST_FIRST_LETTER,
  HINT_COST_REVEAL,
} from '../../lib/constants'
import type { LetterCountHint, FirstLetterHint } from '../../lib/hints'

interface HintsPanelProps {
  coins: number
  freeHintAvailable: boolean
  onLetterCountHint: () => LetterCountHint[] | null
  onFirstLetterHint: () => FirstLetterHint[] | null
  onRevealHint: () => string | null
  onOpenShop: () => void
}

type HintResult =
  | { type: 'letter_count'; data: LetterCountHint[] }
  | { type: 'first_letter'; data: FirstLetterHint[] }
  | { type: 'reveal'; word: string }

export default function HintsPanel({
  coins,
  freeHintAvailable,
  onLetterCountHint,
  onFirstLetterHint,
  onRevealHint,
  onOpenShop,
}: HintsPanelProps) {
  const [confirmType, setConfirmType] = useState<
    'letter_count' | 'first_letter' | 'reveal' | null
  >(null)
  const [result, setResult] = useState<HintResult | null>(null)

  const confirmCost =
    confirmType === 'letter_count'
      ? HINT_COST_LETTER_COUNT
      : confirmType === 'first_letter'
        ? HINT_COST_FIRST_LETTER
        : HINT_COST_REVEAL

  const confirmLabel =
    confirmType === 'letter_count'
      ? 'Harf Sayisi Ipucu'
      : confirmType === 'first_letter'
        ? 'Bas Harf Ipucu'
        : 'Kelime Ac'

  const handleConfirm = useCallback(() => {
    if (!confirmType) return

    if (confirmType === 'letter_count') {
      const data = onLetterCountHint()
      if (data) setResult({ type: 'letter_count', data })
    } else if (confirmType === 'first_letter') {
      const data = onFirstLetterHint()
      if (data) setResult({ type: 'first_letter', data })
    } else {
      const word = onRevealHint()
      if (word) setResult({ type: 'reveal', word })
    }
    setConfirmType(null)
  }, [confirmType, onLetterCountHint, onFirstLetterHint, onRevealHint])

  // Show result view
  if (result) {
    return (
      <div className="space-y-3">
        {result.type === 'letter_count' && (
          <>
            <p className="text-xs font-semibold text-surface-500 dark:text-surface-400">
              Bulunmamis kelimelerin uzunluk dagilimi:
            </p>
            <div className="flex flex-wrap gap-2">
              {result.data.map(({ length, count }) => (
                <div
                  key={length}
                  className="flex items-center gap-1.5 rounded-lg bg-surface-100 px-3 py-1.5 dark:bg-surface-800"
                >
                  <span className="text-sm font-bold text-primary-600 dark:text-accent-400">
                    {length}
                  </span>
                  <span className="text-xs text-surface-500">harfli:</span>
                  <span className="text-sm font-bold text-surface-700 dark:text-surface-300">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {result.type === 'first_letter' && (
          <>
            <p className="text-xs font-semibold text-surface-500 dark:text-surface-400">
              Bulunmamis kelimelerin bas harfleri:
            </p>
            <div className="flex flex-wrap gap-2">
              {result.data.map(({ letter, count }) => (
                <div
                  key={letter}
                  className="flex items-center gap-1.5 rounded-lg bg-surface-100 px-3 py-1.5 dark:bg-surface-800"
                >
                  <span className="text-sm font-bold text-primary-600 dark:text-accent-400">
                    {letter}
                  </span>
                  <span className="text-xs text-surface-500">ile:</span>
                  <span className="text-sm font-bold text-surface-700 dark:text-surface-300">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {result.type === 'reveal' && (
          <div className="text-center">
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Acilan kelime:
            </p>
            <p className="mt-1 text-lg font-bold uppercase text-primary-600 dark:text-accent-400">
              {result.word}
            </p>
          </div>
        )}

        <button
          onClick={() => setResult(null)}
          aria-label="Başka ipucu al"
          className="w-full rounded-xl bg-surface-100 py-2 text-xs font-semibold text-surface-600 transition-colors hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
        >
          Baska ipucu al
        </button>
      </div>
    )
  }

  // Show confirm dialog
  if (confirmType) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm font-semibold text-surface-700 dark:text-surface-300">
          {confirmLabel}
        </p>
        <p className="text-xs text-surface-500">
          {freeHintAvailable ? (
            <span className="font-semibold text-success-500">
              Günlük ücretsiz ipucu!
            </span>
          ) : (
            <>
              Bu ipucu icin{' '}
              <span className="font-bold text-yellow-600 dark:text-yellow-400">
                {confirmCost} jeton
              </span>{' '}
              harcanacak.
            </>
          )}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setConfirmType(null)}
            aria-label="İpucundan vazgeç"
            className="flex-1 rounded-xl bg-surface-100 py-2.5 text-sm font-semibold text-surface-600 transition-colors hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
          >
            Vazgec
          </button>
          <button
            onClick={handleConfirm}
            aria-label={`${confirmLabel} ipucunu onayla`}
            className="flex-1 rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 dark:bg-accent-500 dark:hover:bg-accent-600"
          >
            Devam
          </button>
        </div>
      </div>
    )
  }

  // Default: 3 hint buttons
  const hints = [
    {
      type: 'letter_count' as const,
      Icon: Hash,
      title: 'Harf Sayisi',
      desc: 'Kalan kelimelerin uzunluk dagilimi',
      cost: HINT_COST_LETTER_COUNT,
    },
    {
      type: 'first_letter' as const,
      Icon: Type,
      title: 'Bas Harf',
      desc: 'Kalan kelimelerin bas harfleri',
      cost: HINT_COST_FIRST_LETTER,
    },
    {
      type: 'reveal' as const,
      Icon: Eye,
      title: 'Kelime Ac',
      desc: 'Rastgele bir kelimeyi göster (yari puan)',
      cost: HINT_COST_REVEAL,
    },
  ]

  return (
    <div className="space-y-2">
      {freeHintAvailable && (
        <div className="mb-1 flex items-center justify-center gap-1.5 rounded-lg bg-success-500/10 px-3 py-1.5 text-xs font-semibold text-success-500">
          <Gift className="h-3.5 w-3.5" />
          Günlük 1 ücretsiz ipucu hakkın var!
        </div>
      )}

      {hints.map(({ type, Icon, title, desc, cost }) => {
        const canAfford = freeHintAvailable || coins >= cost
        return (
          <button
            key={type}
            onClick={() => setConfirmType(type)}
            disabled={!canAfford}
            aria-label={`${title} ipucunu seç`}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
              canAfford
                ? 'bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700'
                : 'cursor-not-allowed bg-surface-100/50 opacity-50 dark:bg-surface-800/50'
            }`}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                canAfford
                  ? 'bg-primary-600/10 text-primary-600 dark:bg-accent-500/10 dark:text-accent-400'
                  : 'bg-surface-200 text-surface-400 dark:bg-surface-700'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                {title}
              </p>
              <p className="text-xs text-surface-400 truncate">{desc}</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold">
              {freeHintAvailable ? (
                <span className="text-success-500">Ücretsiz</span>
              ) : (
                <>
                  <Coins className="h-3.5 w-3.5 text-yellow-500" />
                  <span className="text-yellow-600 dark:text-yellow-400">
                    {cost}
                  </span>
                </>
              )}
            </div>
          </button>
        )
      })}

      {!freeHintAvailable && coins < HINT_COST_LETTER_COUNT && (
        <button
          onClick={onOpenShop}
          aria-label="Jeton satın al"
          className="flex w-full items-center justify-center gap-1 pt-1 text-xs font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-accent-400 dark:hover:text-accent-300"
        >
          <Coins className="h-3.5 w-3.5" />
          Jeton Satin Al
        </button>
      )}
    </div>
  )
}
