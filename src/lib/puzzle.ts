import { WORDS } from '../data/words'
import type { Puzzle } from '../types'
import { findAllValidWords, findPangrams } from './dictionary'
import {
  MIN_WORD_LENGTH,
  PUZZLE_LETTER_COUNT,
  MIN_VALID_WORDS,
  PANGRAM_BONUS,
  RANKS,
} from './constants'

function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) & 0xffffffff
    return (state >>> 0) / 0xffffffff
  }
}

function dateToSeed(date: Date): number {
  const str = formatDate(date)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getUniqueLetters(word: string): string[] {
  return [...new Set(word)]
}

function shuffle<T>(arr: T[], random: () => number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Puzzle adayı üretir: bir kelime seçer, harflerini 7'ye tamamlar,
 * merkez harf belirler ve geçerli kelimeleri bulur.
 */
function buildPuzzleFromWord(
  baseWord: string,
  random: () => number,
): {
  letters: string[]
  centerLetter: string
  validWords: string[]
  pangrams: string[]
} | null {
  const baseLetters = getUniqueLetters(baseWord)

  let puzzleLetters: Set<string>

  if (baseLetters.length >= PUZZLE_LETTER_COUNT) {
    puzzleLetters = new Set(baseLetters.slice(0, PUZZLE_LETTER_COUNT))
  } else {
    // 7'ye tamamla: kelime havuzundaki harfleri dene, en çok kelime üreten ekleri seç
    puzzleLetters = new Set(baseLetters)
    const allLetters = new Set(WORDS.join(''))

    while (puzzleLetters.size < PUZZLE_LETTER_COUNT) {
      let bestLetter = ''
      let bestCount = -1

      for (const candidate of allLetters) {
        if (puzzleLetters.has(candidate)) continue
        const trial = new Set([...puzzleLetters, candidate])
        const count = WORDS.filter(
          (w) =>
            w.length >= MIN_WORD_LENGTH && [...w].every((ch) => trial.has(ch)),
        ).length
        if (count > bestCount) {
          bestCount = count
          bestLetter = candidate
        }
      }

      if (!bestLetter) break
      puzzleLetters.add(bestLetter)
    }
  }

  if (puzzleLetters.size < PUZZLE_LETTER_COUNT) return null

  const lettersArr = [...puzzleLetters]

  // Her harf için: kaç kelime üretir ve kaç pangram verir
  const letterStats = lettersArr.map((letter) => {
    const words = findAllValidWords(lettersArr, letter)
    const pgs = findPangrams(words, lettersArr)
    return { letter, wordCount: words.length, pangramCount: pgs.length }
  })

  // Önce pangram veren ve MIN_VALID_WORDS'ü karşılayan harfleri tercih et
  const withPangrams = letterStats.filter(
    (l) => l.pangramCount > 0 && l.wordCount >= MIN_VALID_WORDS,
  )
  const viable =
    withPangrams.length > 0
      ? withPangrams
      : letterStats.filter((l) => l.wordCount >= MIN_VALID_WORDS)

  if (viable.length === 0) return null

  // En çok kelime üreten harflerden birini seç
  viable.sort((a, b) => b.wordCount - a.wordCount)
  const maxCount = viable[0].wordCount
  const topLetters = viable.filter((l) => l.wordCount === maxCount)
  const centerLetter =
    topLetters[Math.floor(random() * topLetters.length)].letter

  const validWords = findAllValidWords(lettersArr, centerLetter)
  const pangrams = findPangrams(validWords, lettersArr)
  const shuffled = shuffle(
    lettersArr.filter((l) => l !== centerLetter),
    random,
  )

  return {
    letters: [centerLetter, ...shuffled],
    centerLetter,
    validWords,
    pangrams,
  }
}

export function generateDailyPuzzle(date: Date): Puzzle {
  const seed = dateToSeed(date)
  const random = seededRandom(seed)

  // Önce tam 7 benzersiz harfli kelimeleri dene (garantili pangram temeli)
  const sevenLetterBases = shuffle(
    WORDS.filter((w) => getUniqueLetters(w).length === PUZZLE_LETTER_COUNT),
    random,
  )

  for (const word of sevenLetterBases) {
    const result = buildPuzzleFromWord(word, random)
    if (result && result.pangrams.length > 0) {
      return { ...result, date: formatDate(date) }
    }
  }

  // Fallback: tüm adayları dene (5+ benzersiz harf)
  const allCandidates = shuffle(
    WORDS.filter(
      (w) =>
        getUniqueLetters(w).length >= 5 &&
        getUniqueLetters(w).length < PUZZLE_LETTER_COUNT,
    ),
    random,
  )

  for (const word of allCandidates) {
    const result = buildPuzzleFromWord(word, random)
    if (result) {
      return { ...result, date: formatDate(date) }
    }
  }

  // Son çare
  const fallback = buildPuzzleFromWord(WORDS[0], random)!
  return { ...fallback, date: formatDate(date) }
}

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
