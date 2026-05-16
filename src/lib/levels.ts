import { LEVEL_DATA } from '../data/levels'
import { findAllValidWords, findPangrams } from './dictionary'

export interface LevelPuzzle {
  level: number
  letters: string[]
  centerLetter: string
  validWords: string[]
  pangrams: string[]
  targetWordCount: number
}

export interface LevelProgress {
  currentLevel: number
  completedLevels: number[]
  totalStars: number
  levelStars: Record<number, number>
}

const STORAGE_KEY = 'kelimece-levels'

export const TOTAL_LEVELS = LEVEL_DATA.length

export function generateLevelPuzzle(level: number): LevelPuzzle {
  const idx = Math.max(0, Math.min(level - 1, LEVEL_DATA.length - 1))
  const data = LEVEL_DATA[idx]

  // Center letter always first in the array
  const others = data.letters.filter((l) => l !== data.center)
  const orderedLetters = [data.center, ...others]

  const validWords = findAllValidWords(data.letters, data.center)
  const pangrams = findPangrams(validWords, data.letters)

  return {
    level,
    letters: orderedLetters,
    centerLetter: data.center,
    validWords,
    pangrams,
    targetWordCount: data.target,
  }
}

/**
 * Seviye tamamlandiginda kac yildiz alinir (1-3).
 */
export function calculateStars(
  foundCount: number,
  targetCount: number,
  totalWords: number,
): number {
  if (foundCount >= totalWords) return 3
  if (foundCount >= Math.floor(targetCount * 1.5)) return 2
  return 1
}

export function loadProgress(): LevelProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw)
      return {
        currentLevel: 1,
        completedLevels: [],
        totalStars: 0,
        levelStars: {},
      }
    const parsed = JSON.parse(raw)
    return { levelStars: {}, ...parsed }
  } catch {
    return {
      currentLevel: 1,
      completedLevels: [],
      totalStars: 0,
      levelStars: {},
    }
  }
}

export function saveProgress(progress: LevelProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // silently ignore
  }
}
