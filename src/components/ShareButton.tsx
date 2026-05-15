import { Share2 } from 'lucide-react'
import type { Puzzle } from '../types'
import { formatShareText, shareResult } from '../lib/share'

interface ShareButtonProps {
  puzzle: Puzzle
  foundWords: string[]
  score: number
  maxScore: number
  onMessage: (text: string, type: 'success' | 'error' | 'info') => void
}

export default function ShareButton({
  puzzle,
  foundWords,
  score,
  maxScore,
  onMessage,
}: ShareButtonProps) {
  const disabled = foundWords.length === 0

  async function handleShare() {
    const text = formatShareText(puzzle, foundWords, score, maxScore)
    const result = await shareResult(text)

    if (result === 'shared') {
      onMessage('Paylaşıldı!', 'success')
    } else if (result === 'copied') {
      onMessage('Kopyalandı!', 'success')
    } else {
      onMessage('Paylaşılamadı', 'error')
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 active:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Share2 className="h-4 w-4" />
      Sonucu Paylaş
    </button>
  )
}
