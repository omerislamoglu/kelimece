import {
  MIN_WORD_LENGTH,
  PANGRAM_BONUS,
  RANKS,
} from './constants'

export function calculateScore(word: string, letters: string[]): number {
  if (word.length < MIN_WORD_LENGTH) return 0
  if (word.length === MIN_WORD_LENGTH) return 1

  const baseScore = word.length - (MIN_WORD_LENGTH - 1)
  const wordLetters = new Set(word)
  const isPangram = letters.every((l) => wordLetters.has(l))

  return baseScore + (isPangram ? PANGRAM_BONUS : 0)
}

export { RANKS }

export function getRankFromScore(score: number, maxScore: number): string {
  if (maxScore === 0) return RANKS[0].label
  const ratio = score / maxScore

  let rank: string = RANKS[0].label
  for (const { threshold, label } of RANKS) {
    if (ratio >= threshold) rank = label
  }
  return rank
}
