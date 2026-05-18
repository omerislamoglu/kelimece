import { WORDS } from '../data/words'
import { MIN_WORD_LENGTH } from './constants'
import { isValidTurkishWord, isSpellCheckerReady } from './spellchecker'

// ── Kelime setleri ─────────────────────────────────────────────────────────────

export const WORD_SET = new Set(WORDS)

export function normalizeWord(word: string): string {
  return word.toLocaleLowerCase('tr-TR').trim()
}

// ── Katman 3: Kullanıcı sözlüğü (localStorage) ────────────────────────────────

const USER_DICT_KEY = 'kelimece-user-dictionary'

function getUserDictionary(): Set<string> {
  try {
    const raw = localStorage.getItem(USER_DICT_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

export function addToUserDictionary(word: string): void {
  const dict = getUserDictionary()
  dict.add(word.toLocaleLowerCase('tr-TR'))
  localStorage.setItem(USER_DICT_KEY, JSON.stringify([...dict]))
}

export function removeFromUserDictionary(word: string): void {
  const dict = getUserDictionary()
  dict.delete(word.toLocaleLowerCase('tr-TR'))
  localStorage.setItem(USER_DICT_KEY, JSON.stringify([...dict]))
}

export function isInUserDictionary(word: string): boolean {
  return getUserDictionary().has(word.toLocaleLowerCase('tr-TR'))
}

// ── 3 Katmanlı Doğrulama ──────────────────────────────────────────────────────

/**
 * 3 katmanlı doğrulama: Curated → Hunspell → User Dictionary
 * Herhangi bir katmanda geçerliyse true döner.
 */
export function isAcceptedWord(word: string): boolean {
  const w = word.toLocaleLowerCase('tr-TR')

  // Katman 1: Curated listede mi?
  if (WORD_SET.has(w)) return true

  // Katman 2: Hunspell yüklendiyse kontrol et
  if (isSpellCheckerReady() && isValidTurkishWord(w)) return true

  // Katman 3: Kullanıcı sözlüğünde mi?
  if (isInUserDictionary(w)) return true

  return false
}

// ── Puzzle fonksiyonları ───────────────────────────────────────────────────────

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
