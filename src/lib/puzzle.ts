import { WORDS } from '../data/words'
import type { Puzzle } from '../types'

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

function findValidWords(
  letters: Set<string>,
  centerLetter: string,
): string[] {
  return WORDS.filter((word) => {
    if (word.length < 4) return false
    if (!word.includes(centerLetter)) return false
    return [...word].every((ch) => letters.has(ch))
  })
}

function findPangrams(words: string[], letters: Set<string>): string[] {
  return words.filter((word) => {
    const wordLetters = new Set(word)
    return [...letters].every((l) => wordLetters.has(l))
  })
}

/**
 * Puzzle adayı üretir: bir kelime seçer, harflerini 7'ye tamamlar,
 * merkez harf belirler ve geçerli kelimeleri bulur.
 *
 * Kelime listesi küçükken (prototip) 5-6 benzersiz harfli kelimelerden
 * de puzzle üretebilmek için, ek harfler eklenerek 7 harfe tamamlanır.
 * Ek harfler, geçerli kelime sayısını maksimize edecek şekilde seçilir.
 */
function buildPuzzleFromWord(
  baseWord: string,
  random: () => number,
): { letters: string[]; centerLetter: string; validWords: string[]; pangrams: string[] } | null {
  const baseLetters = getUniqueLetters(baseWord)

  let puzzleLetters: Set<string>

  if (baseLetters.length >= 7) {
    // Zaten 7+ benzersiz harf var — ilk 7'yi al
    puzzleLetters = new Set(baseLetters.slice(0, 7))
  } else {
    // 7'ye tamamla: kelime havuzundaki harfleri dene, en çok kelime üreten ekleri seç
    puzzleLetters = new Set(baseLetters)
    const allLetters = new Set(WORDS.join(''))

    while (puzzleLetters.size < 7) {
      let bestLetter = ''
      let bestCount = -1

      for (const candidate of allLetters) {
        if (puzzleLetters.has(candidate)) continue
        const trial = new Set([...puzzleLetters, candidate])
        const count = WORDS.filter(
          (w) => w.length >= 4 && [...w].every((ch) => trial.has(ch)),
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

  if (puzzleLetters.size < 7) return null

  const lettersArr = [...puzzleLetters]

  // Merkez harf: en çok geçerli kelimede geçen harf
  // (eşitlik durumunda random seçim)
  const letterFreq = lettersArr.map((letter) => ({
    letter,
    count: WORDS.filter(
      (w) =>
        w.length >= 4 &&
        w.includes(letter) &&
        [...w].every((ch) => puzzleLetters.has(ch)),
    ).length,
  }))
  letterFreq.sort((a, b) => b.count - a.count)

  // En yüksek frekanslı harflerden birini seç
  const maxCount = letterFreq[0].count
  const topLetters = letterFreq.filter((l) => l.count === maxCount)
  const centerLetter =
    topLetters[Math.floor(random() * topLetters.length)].letter

  const validWords = findValidWords(puzzleLetters, centerLetter)
  if (validWords.length < 5) return null

  const pangrams = findPangrams(validWords, puzzleLetters)
  const shuffled = shuffle(lettersArr.filter((l) => l !== centerLetter), random)

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

  // Pangram adaylarını bul ve önceliklendir (çok benzersiz harf > az)
  const candidates = WORDS
    .filter((w) => getUniqueLetters(w).length >= 5)
    .sort((a, b) => getUniqueLetters(b).length - getUniqueLetters(a).length)

  const shuffled = shuffle(candidates, random)

  for (const word of shuffled) {
    const result = buildPuzzleFromWord(word, random)
    if (result) {
      return {
        ...result,
        date: formatDate(date),
      }
    }
  }

  // Fallback — ilk kelimeden puzzle üret
  const fallback = buildPuzzleFromWord(WORDS[0], random)!
  return {
    ...fallback,
    date: formatDate(date),
  }
}

export function calculateScore(word: string, letters: string[]): number {
  if (word.length < 4) return 0
  if (word.length === 4) return 1

  const baseScore = word.length - 3
  const wordLetters = new Set(word)
  const isPangram = letters.every((l) => wordLetters.has(l))

  return baseScore + (isPangram ? 7 : 0)
}

const RANKS = [
  { threshold: 0, label: 'Acemi' },
  { threshold: 0.05, label: 'Başlangıç' },
  { threshold: 0.15, label: 'Orta' },
  { threshold: 0.25, label: 'İyi' },
  { threshold: 0.4, label: 'Harika' },
  { threshold: 0.6, label: 'Muhteşem' },
  { threshold: 0.75, label: 'Üstat' },
  { threshold: 0.9, label: 'Dahi' },
  { threshold: 1.0, label: 'Kraliçe Arı' },
] as const

export function getRankFromScore(score: number, maxScore: number): string {
  if (maxScore === 0) return RANKS[0].label
  const ratio = score / maxScore

  let rank: string = RANKS[0].label
  for (const { threshold, label } of RANKS) {
    if (ratio >= threshold) rank = label
  }
  return rank
}
