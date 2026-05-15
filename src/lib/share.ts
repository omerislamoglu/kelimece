import type { Puzzle } from '../types'
import { getRankFromScore } from './puzzle'

function formatTurkishDate(dateStr: string): string {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ]
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${d} ${months[m - 1]} ${y}`
}

export function formatShareText(
  puzzle: Puzzle,
  foundWords: string[],
  score: number,
  maxScore: number,
): string {
  const rank = getRankFromScore(score, maxScore)
  const totalWords = puzzle.validWords.length
  const pangramCount = foundWords.filter((w) =>
    puzzle.pangrams.includes(w),
  ).length

  return [
    `Kelimece \u2022 ${formatTurkishDate(puzzle.date)}`,
    `\u2B50 Skor: ${score} \u2014 ${rank}`,
    `\uD83D\uDCDD ${foundWords.length}/${totalWords} kelime bulundu`,
    `\uD83D\uDC8E ${pangramCount} tam kelime`,
    '',
    'kelimece.app',
  ].join('\n')
}

export async function shareResult(
  text: string,
): Promise<'shared' | 'copied' | 'failed'> {
  if (navigator.share) {
    try {
      await navigator.share({ text })
      return 'shared'
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return 'failed'
      }
    }
  }

  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}
