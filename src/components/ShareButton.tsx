import { Share2 } from 'lucide-react'
import { formatShareText, shareResult } from '../lib/share'

interface ShareButtonProps {
  level: number
  foundWords: string[]
  totalWords: number
  stars: number
  score: number
  onMessage: (
    text: string,
    type: 'success' | 'error' | 'info' | 'warning',
  ) => void
}

export default function ShareButton({
  level,
  foundWords,
  totalWords,
  stars,
  score,
  onMessage,
}: ShareButtonProps) {
  async function handleShare() {
    const text = formatShareText(level, foundWords, totalWords, stars, score)
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
      aria-label="Sonucu paylaş"
      className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 active:bg-primary-800"
    >
      <Share2 className="h-4 w-4" />
      Sonucu Paylaş
    </button>
  )
}
