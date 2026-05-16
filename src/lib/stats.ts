export interface GameStats {
  levelsCompleted: number
  totalStars: number
  perfectLevels: number
  totalWordsFound: number
  totalBonusWords: number
  totalPangrams: number
  coinsEarned: number
  coinsSpent: number
  hintsUsed: number
  longestWordFound: string
  firstPlayDate: string
  lastPlayDate: string
  playStreak: number
  longestPlayStreak: number
}

const STATS_KEY = 'kelimece-stats'

const DEFAULT_STATS: GameStats = {
  levelsCompleted: 0,
  totalStars: 0,
  perfectLevels: 0,
  totalWordsFound: 0,
  totalBonusWords: 0,
  totalPangrams: 0,
  coinsEarned: 0,
  coinsSpent: 0,
  hintsUsed: 0,
  longestWordFound: '',
  firstPlayDate: '',
  lastPlayDate: '',
  playStreak: 0,
  longestPlayStreak: 0,
}

export function getStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (!raw) return { ...DEFAULT_STATS }
    return { ...DEFAULT_STATS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_STATS }
  }
}

function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch {
    // silently ignore
  }
}

export function updateStats(updates: Partial<GameStats>): void {
  const stats = getStats()
  Object.assign(stats, updates)
  saveStats(stats)
}

export function incrementStat<K extends keyof GameStats>(
  key: K,
  amount: number,
): void {
  const stats = getStats()
  const current = stats[key]
  if (typeof current === 'number') {
    ;(stats[key] as number) = current + amount
    saveStats(stats)
  }
}

export function recordWordFound(
  word: string,
  isPangram: boolean,
  isBonus: boolean,
): void {
  const stats = getStats()
  if (isBonus) {
    stats.totalBonusWords += 1
  } else {
    stats.totalWordsFound += 1
  }
  if (isPangram) {
    stats.totalPangrams += 1
  }
  if (word.length > stats.longestWordFound.length) {
    stats.longestWordFound = word
  }
  saveStats(stats)
}

export function recordLevelComplete(stars: number): void {
  const stats = getStats()
  stats.levelsCompleted += 1
  stats.totalStars += stars
  if (stars === 3) {
    stats.perfectLevels += 1
  }
  saveStats(stats)
}

export function recordHintUsed(cost: number): void {
  const stats = getStats()
  stats.hintsUsed += 1
  stats.coinsSpent += cost
  saveStats(stats)
}

export function recordCoinsEarned(amount: number): void {
  incrementStat('coinsEarned', amount)
}

function getTodayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isConsecutiveDay(dateStr: string): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const y = yesterday.getFullYear()
  const m = String(yesterday.getMonth() + 1).padStart(2, '0')
  const d = String(yesterday.getDate()).padStart(2, '0')
  return dateStr === `${y}-${m}-${d}`
}

export function recordDailyPlay(): void {
  const stats = getStats()
  const today = getTodayStr()

  if (!stats.firstPlayDate) {
    stats.firstPlayDate = today
  }

  if (stats.lastPlayDate === today) {
    saveStats(stats)
    return
  }

  if (stats.lastPlayDate && isConsecutiveDay(stats.lastPlayDate)) {
    stats.playStreak += 1
  } else {
    stats.playStreak = 1
  }

  stats.longestPlayStreak = Math.max(stats.longestPlayStreak, stats.playStreak)
  stats.lastPlayDate = today
  saveStats(stats)
}
