import type { LevelPuzzle } from './levels'
import { localDateStr } from './constants'

export type HintType = 'letter_count' | 'first_letter' | 'reveal_word'

export interface LetterCountHint {
  length: number
  count: number
}

export interface FirstLetterHint {
  letter: string
  count: number
}

const FREE_HINT_KEY = 'kelimece-free-hint-date'

export function isFreeHintAvailable(): boolean {
  try {
    const used = localStorage.getItem(FREE_HINT_KEY)
    const today = localDateStr()
    return used !== today
  } catch {
    return false
  }
}

export function consumeFreeHint(): void {
  try {
    const today = localDateStr()
    localStorage.setItem(FREE_HINT_KEY, today)
  } catch {
    // ignore
  }
}

export function getLetterCountHint(
  puzzle: LevelPuzzle,
  foundWords: string[],
): LetterCountHint[] {
  const foundSet = new Set(foundWords)
  const unfound = puzzle.validWords.filter((w) => !foundSet.has(w))

  const map = new Map<number, number>()
  for (const w of unfound) {
    map.set(w.length, (map.get(w.length) ?? 0) + 1)
  }

  return [...map.entries()]
    .map(([length, count]) => ({ length, count }))
    .sort((a, b) => a.length - b.length)
}

export function getFirstLetterHint(
  puzzle: LevelPuzzle,
  foundWords: string[],
): FirstLetterHint[] {
  const foundSet = new Set(foundWords)
  const unfound = puzzle.validWords.filter((w) => !foundSet.has(w))

  const map = new Map<string, number>()
  for (const w of unfound) {
    const letter = w[0].toLocaleUpperCase('tr-TR')
    map.set(letter, (map.get(letter) ?? 0) + 1)
  }

  return [...map.entries()]
    .map(([letter, count]) => ({ letter, count }))
    .sort((a, b) => a.letter.localeCompare(b.letter, 'tr'))
}

export function pickRandomUnfoundWord(
  puzzle: LevelPuzzle,
  foundWords: string[],
): string | null {
  const foundSet = new Set(foundWords)
  const unfound = puzzle.validWords.filter((w) => !foundSet.has(w))
  if (unfound.length === 0) return null
  return unfound[Math.floor(Math.random() * unfound.length)]
}
