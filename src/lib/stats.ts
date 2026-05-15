export interface GameStats {
  gamesPlayed: number
  currentStreak: number
  longestStreak: number
  totalWords: number
  avgScore: number
  highScore: number
  lastPlayedDate: string | null
}

const STATS_KEY = 'kelimece-stats'

const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalWords: 0,
  avgScore: 0,
  highScore: 0,
  lastPlayedDate: null,
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

function isYesterday(dateStr: string): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const y = yesterday.getFullYear()
  const m = String(yesterday.getMonth() + 1).padStart(2, '0')
  const d = String(yesterday.getDate()).padStart(2, '0')
  return dateStr === `${y}-${m}-${d}`
}

function isToday(dateStr: string): boolean {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return dateStr === `${y}-${m}-${d}`
}

export function updateStats(
  date: string,
  score: number,
  wordsFound: number,
): void {
  const stats = getStats()

  // Aynı gün zaten kaydedildiyse tekrar kaydetme
  if (stats.lastPlayedDate === date) return

  stats.gamesPlayed += 1
  stats.totalWords += wordsFound
  stats.highScore = Math.max(stats.highScore, score)

  // Ortalama skor hesapla
  const totalScore = stats.avgScore * (stats.gamesPlayed - 1) + score
  stats.avgScore = Math.round(totalScore / stats.gamesPlayed)

  // Seri hesaplaması
  if (stats.lastPlayedDate && isYesterday(stats.lastPlayedDate)) {
    stats.currentStreak += 1
  } else if (stats.lastPlayedDate && isToday(stats.lastPlayedDate)) {
    // Bugün zaten oynamış — seriyi değiştirme (bu satıra ulaşılmamalı ama güvenlik için)
  } else {
    stats.currentStreak = 1
  }
  stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak)

  stats.lastPlayedDate = date

  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}
