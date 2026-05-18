import { WORDS } from '../data/words'
import { MIN_WORD_LENGTH } from './constants'

export const WORD_SET = new Set(WORDS)

export function normalizeWord(word: string): string {
  return word.toLocaleLowerCase('tr-TR').trim()
}

/**
 * Her harf kelime basina sadece 1 kez kullanilabilir.
 * Puzzle'daki harflerin frekansini kontrol eder.
 */
export function canFormWord(
  word: string,
  letters: string[],
  centerLetter: string,
): boolean {
  if (word.length < MIN_WORD_LENGTH) return false
  if (word.length > letters.length) return false
  if (!word.includes(centerLetter)) return false

  // Her harfin kullanim sayisini kontrol et
  const available = new Map<string, number>()
  for (const ch of letters) {
    available.set(ch, (available.get(ch) ?? 0) + 1)
  }

  for (const ch of word) {
    const count = available.get(ch)
    if (!count) return false
    available.set(ch, count - 1)
  }

  return true
}

export function findAllValidWords(
  letters: string[],
  centerLetter: string,
): string[] {
  return WORDS.filter((word) => canFormWord(word, letters, centerLetter))
}

export function findPangrams(words: string[], letters: string[]): string[] {
  const letterSet = new Set(letters)
  return words.filter((word) => {
    const wordLetters = new Set(word)
    return [...letterSet].every((l) => wordLetters.has(l))
  })
}
