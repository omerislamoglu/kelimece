import { WORDS } from '../data/words'
import { findAllValidWords, findPangrams, normalizeWord } from './dictionary'
import { PUZZLE_LETTER_COUNT } from './constants'

// ── Deterministik PRNG (Mulberry32) ────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function dateSeed(date: Date): number {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  return y * 10000 + m * 100 + d
}

// ── Türkçe harf kümesi ─────────────────────────────────────────────────────────

const TR_LETTERS = 'abcçdefgğhıijklmnoöprsştuüvyz'

function uniqueLetters(word: string): Set<string> {
  return new Set([...word])
}

// ── Günlük Bulmaca Üretimi ─────────────────────────────────────────────────────

export interface DailyPuzzle {
  date: string // YYYY-MM-DD
  letters: string[]
  centerLetter: string
  validWords: string[]
  pangrams: string[]
}

export function getDailyPuzzle(date: Date): DailyPuzzle {
  const seed = dateSeed(date)
  const rng = mulberry32(seed)
  const dateStr = date.toISOString().slice(0, 10)

  // Find all 7-unique-letter words (potential pangram sources)
  const pangramCandidates = WORDS.filter((w) => {
    const letters = uniqueLetters(w)
    if (letters.size !== PUZZLE_LETTER_COUNT) return false
    // All letters must be valid Turkish letters
    for (const l of letters) {
      if (!TR_LETTERS.includes(l)) return false
    }
    return true
  })

  // If not enough exact pangrams, also consider words with 7+ unique letters
  // and pick 7 of their letters
  let chosenLetters: string[]
  let centerLetter: string

  if (pangramCandidates.length > 0) {
    // Pick a pangram deterministically
    const idx = Math.floor(rng() * pangramCandidates.length)
    const pangram = pangramCandidates[idx]
    const letters = [...uniqueLetters(pangram)]

    // Shuffle letters deterministically
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[letters[i], letters[j]] = [letters[j], letters[i]]
    }

    centerLetter = letters[0]
    chosenLetters = letters
  } else {
    // Fallback: pick 7 random letters (shouldn't happen with a good word list)
    const pool = [...TR_LETTERS]
    chosenLetters = []
    for (let i = 0; i < PUZZLE_LETTER_COUNT; i++) {
      const j = Math.floor(rng() * pool.length)
      chosenLetters.push(pool[j])
      pool.splice(j, 1)
    }
    centerLetter = chosenLetters[0]
  }

  const normalized = chosenLetters.map((l) => normalizeWord(l))
  const normalizedCenter = normalizeWord(centerLetter)

  const others = normalized.filter((l) => l !== normalizedCenter)
  const orderedLetters = [normalizedCenter, ...others]

  const validWords = findAllValidWords(orderedLetters, normalizedCenter)
  const pangrams = findPangrams(validWords, orderedLetters)

  return {
    date: dateStr,
    letters: orderedLetters,
    centerLetter: normalizedCenter,
    validWords,
    pangrams,
  }
}

// ── Daily State (localStorage) ─────────────────────────────────────────────────

const DAILY_STATE_KEY = 'kelimece-daily-state'
const DAILY_STATS_KEY = 'kelimece-daily-stats'

interface DailyState {
  date: string
  foundWords: string[]
  bonusWords: string[]
  score: number
  completed: boolean
}

export function loadDailyState(date: string): DailyState | null {
  try {
    const raw = localStorage.getItem(DAILY_STATE_KEY)
    if (!raw) return null
    const saved: DailyState = JSON.parse(raw)
    if (saved.date !== date) return null
    return saved
  } catch {
    return null
  }
}

export function saveDailyState(state: DailyState): void {
  try {
    localStorage.setItem(DAILY_STATE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

export function isDailyCompleted(date: Date): boolean {
  const dateStr = date.toISOString().slice(0, 10)
  const state = loadDailyState(dateStr)
  return state?.completed ?? false
}

// ── Daily Stats ────────────────────────────────────────────────────────────────

export interface DailyStats {
  streak: number
  longestStreak: number
  totalDays: number
  perfectDays: number
  lastPlayedDate: string // YYYY-MM-DD
}

function defaultDailyStats(): DailyStats {
  return {
    streak: 0,
    longestStreak: 0,
    totalDays: 0,
    perfectDays: 0,
    lastPlayedDate: '',
  }
}

export function getDailyStats(): DailyStats {
  try {
    const raw = localStorage.getItem(DAILY_STATS_KEY)
    if (!raw) return defaultDailyStats()
    return { ...defaultDailyStats(), ...JSON.parse(raw) }
  } catch {
    return defaultDailyStats()
  }
}

export function recordDailyCompletion(
  date: string,
  isPerfect: boolean,
): void {
  const stats = getDailyStats()

  // Already recorded this date
  if (stats.lastPlayedDate === date) {
    // Update perfect status if it improved
    if (isPerfect && !wasPerfect(date)) {
      stats.perfectDays += 1
    }
    saveDailyStats(stats)
    return
  }

  stats.totalDays += 1
  if (isPerfect) stats.perfectDays += 1

  // Calculate streak
  const yesterday = new Date(date)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  if (stats.lastPlayedDate === yesterdayStr) {
    stats.streak += 1
  } else {
    stats.streak = 1
  }

  stats.longestStreak = Math.max(stats.longestStreak, stats.streak)
  stats.lastPlayedDate = date

  saveDailyStats(stats)
}

function wasPerfect(_date: string): boolean {
  // Simple check — we don't store per-day perfect status separately
  // This is a best-effort check
  return false
}

function saveDailyStats(stats: DailyStats): void {
  try {
    localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(stats))
  } catch {
    // ignore
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

export function getToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function formatTurkishDate(date: Date): string {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ]
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

export function secondsUntilMidnight(): number {
  const now = new Date()
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  )
  return Math.floor((midnight.getTime() - now.getTime()) / 1000)
}
