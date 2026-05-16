import { WORDS } from '../data/words'
import { MIN_WORD_LENGTH } from './constants'

export const WORD_SET = new Set(WORDS)

export function normalizeWord(word: string): string {
  return word.toLowerCase().trim()
}

export function canFormWord(
  word: string,
  letterSet: Set<string>,
  centerLetter: string,
): boolean {
  if (word.length < MIN_WORD_LENGTH) return false
  if (!word.includes(centerLetter)) return false
  return [...word].every((ch) => letterSet.has(ch))
}

export function findAllValidWords(
  letterSet: Set<string>,
  centerLetter: string,
): string[] {
  return WORDS.filter((word) => canFormWord(word, letterSet, centerLetter))
}

export function findPangrams(
  words: string[],
  letterSet: Set<string>,
): string[] {
  return words.filter((word) => {
    const wordLetters = new Set(word)
    return [...letterSet].every((l) => wordLetters.has(l))
  })
}
