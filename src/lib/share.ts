export function formatShareText(
  level: number,
  foundWords: string[],
  totalWords: number,
  stars: number,
  score: number,
): string {
  const starStr = '★'.repeat(stars) + '☆'.repeat(3 - stars)

  return [
    `Kelimece \u2022 B\u00F6l\u00FCm ${level}`,
    starStr,
    `\uD83D\uDCDD ${foundWords.length}/${totalWords} kelime bulundu`,
    `\u2B50 Skor: ${score}`,
    '',
    `kelimece.app/seviye/${level}`,
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
