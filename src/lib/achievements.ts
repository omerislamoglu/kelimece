import { ACHIEVEMENTS, ACHIEVEMENT_MAP, type Achievement } from '../data/achievements'
import { getStats, type GameStats } from './stats'
import { getReports } from './wordReports'

const UNLOCKED_KEY = 'kelimece-achievements'
const NO_HINT_KEY = 'kelimece-no-hint-levels'

// ── Unlocked state ─────────────────────────────────────────────────────────────

export function getUnlockedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(UNLOCKED_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function saveUnlockedIds(ids: Set<string>): void {
  try {
    localStorage.setItem(UNLOCKED_KEY, JSON.stringify([...ids]))
  } catch {
    // ignore
  }
}

export function unlockAchievement(id: string): Achievement | null {
  const achievement = ACHIEVEMENT_MAP.get(id)
  if (!achievement) return null

  const unlocked = getUnlockedIds()
  if (unlocked.has(id)) return null

  unlocked.add(id)
  saveUnlockedIds(unlocked)

  return achievement
}

export function getUnlockedAchievements(): Achievement[] {
  const ids = getUnlockedIds()
  return ACHIEVEMENTS.filter((a) => ids.has(a.id))
}

// ── No-hint level tracking ─────────────────────────────────────────────────────

export function getNoHintLevelCount(): number {
  try {
    const raw = localStorage.getItem(NO_HINT_KEY)
    if (!raw) return 0
    return (JSON.parse(raw) as number[]).length
  } catch {
    return 0
  }
}

export function recordNoHintLevel(level: number): void {
  try {
    const raw = localStorage.getItem(NO_HINT_KEY)
    const levels: number[] = raw ? JSON.parse(raw) : []
    if (!levels.includes(level)) {
      levels.push(level)
      localStorage.setItem(NO_HINT_KEY, JSON.stringify(levels))
    }
  } catch {
    // ignore
  }
}

// ── Progress calculation ───────────────────────────────────────────────────────

export interface AchievementProgress {
  current: number
  target: number
}

export function getProgress(
  id: string,
  stats?: GameStats,
): AchievementProgress {
  const s = stats ?? getStats()
  const achievement = ACHIEVEMENT_MAP.get(id)
  if (!achievement) return { current: 0, target: 1 }

  let current = 0

  switch (id) {
    case 'first_word':
    case 'words_10':
    case 'words_50':
    case 'words_100':
    case 'words_500':
      current = s.totalWordsFound + s.totalBonusWords
      break
    case 'level_1':
    case 'level_10':
    case 'level_50':
      current = s.levelsCompleted
      break
    case 'perfect_1':
    case 'perfect_10':
      current = s.perfectLevels
      break
    case 'pangram_1':
    case 'pangram_5':
    case 'pangram_20':
      current = s.totalPangrams
      break
    case 'bonus_10':
    case 'bonus_50':
      current = s.totalBonusWords
      break
    case 'streak_3':
    case 'streak_7':
    case 'streak_30':
      current = s.longestPlayStreak
      break
    case 'report_5':
      current = getReports().length
      break
    case 'no_hint':
      current = getNoHintLevelCount()
      break
    case 'night_owl':
      current = getUnlockedIds().has('night_owl') ? 1 : 0
      break
    case 'long_word':
      current = s.longestWordFound.length >= 7 ? 1 : 0
      break
    default:
      current = 0
  }

  return { current: Math.min(current, achievement.target), target: achievement.target }
}

// ── Check all achievements ─────────────────────────────────────────────────────

export function checkAchievements(stats?: GameStats): string[] {
  const s = stats ?? getStats()
  const unlocked = getUnlockedIds()
  const newlyUnlocked: string[] = []

  for (const achievement of ACHIEVEMENTS) {
    if (unlocked.has(achievement.id)) continue

    const { current, target } = getProgress(achievement.id, s)
    if (current >= target) {
      newlyUnlocked.push(achievement.id)
    }
  }

  // Check time-based (night owl)
  if (!unlocked.has('night_owl')) {
    const hour = new Date().getHours()
    if (hour >= 0 && hour < 4) {
      newlyUnlocked.push('night_owl')
    }
  }

  return newlyUnlocked
}
