/**
 * Kelimece level generator
 * Run: npx tsx scripts/generate-levels.ts
 *
 * Reads the word list, finds valid 7-unique-letter combinations,
 * and outputs new level entries to stdout.
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const wordsFile = readFileSync(
  resolve(__dirname, '../src/data/words.ts'),
  'utf-8',
)

// Extract words from the TS file
const words: string[] = []
const regex = /'([^']+)'/g
let match: RegExpExecArray | null
while ((match = regex.exec(wordsFile)) !== null) {
  words.push(match[1])
}

function normalizeWord(w: string): string {
  return w.toLocaleLowerCase('tr-TR').trim()
}

function uniqueLetters(w: string): Set<string> {
  return new Set([...w])
}

function canFormWord(
  word: string,
  letters: string[],
  centerLetter: string,
): boolean {
  if (word.length < 4) return false
  if (word.length > letters.length) return false
  if (!word.includes(centerLetter)) return false

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

function findValidWords(letters: string[], center: string): string[] {
  return words.filter((w) => canFormWord(normalizeWord(w), letters, center))
}

// Read existing levels to avoid duplicates
const levelsFile = readFileSync(
  resolve(__dirname, '../src/data/levels.ts'),
  'utf-8',
)
const existingKeys = new Set<string>()
const levelRegex = /letters:\s*\[([^\]]+)\]/g
let lm: RegExpExecArray | null
while ((lm = levelRegex.exec(levelsFile)) !== null) {
  const letters = lm[1]
    .replace(/'/g, '')
    .split(',')
    .map((s) => s.trim())
    .sort()
    .join(',')
  existingKeys.add(letters)
}

// Find all words with exactly 7 unique letters
const candidates: { letters: string[]; word: string }[] = []
for (const w of words) {
  const normalized = normalizeWord(w)
  const ul = uniqueLetters(normalized)
  if (ul.size === 7) {
    const sorted = [...ul].sort()
    const key = sorted.join(',')
    if (!existingKeys.has(key)) {
      candidates.push({ letters: [...ul], word: normalized })
      existingKeys.add(key)
    }
  }
}

// Shuffle deterministically
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr]
  let s = seed
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const j = s % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const shuffled = seededShuffle(candidates, 42)

// Difficulty progression: target increases as levels go up
// Levels 102-200: target 4-5
// Levels 201-350: target 5-6
// Levels 351-501: target 6-8
interface LevelEntry {
  letters: string[]
  center: string
  target: number
  validCount: number
}

const newLevels: LevelEntry[] = []

for (const candidate of shuffled) {
  if (newLevels.length >= 400) break

  // Try each letter as center, pick the one with best word count
  let bestCenter = ''
  let bestCount = 0

  for (const letter of candidate.letters) {
    const count = findValidWords(candidate.letters, letter).length
    if (count > bestCount) {
      bestCount = count
      bestCenter = letter
    }
  }

  if (bestCount < 3) continue // Skip if too few words

  // Determine target based on position in the new batch
  const levelIndex = newLevels.length
  let target: number
  if (levelIndex < 100) {
    // Levels 102-201: easier
    target = Math.min(Math.max(Math.floor(bestCount * 0.4), 4), 6)
  } else if (levelIndex < 250) {
    // Levels 202-351: medium
    target = Math.min(Math.max(Math.floor(bestCount * 0.45), 5), 8)
  } else {
    // Levels 352-501: harder
    target = Math.min(Math.max(Math.floor(bestCount * 0.5), 6), 10)
  }

  // Don't set target higher than available words
  target = Math.min(target, bestCount)

  newLevels.push({
    letters: candidate.letters,
    center: bestCenter,
    target,
    validCount: bestCount,
  })
}

// Output as TypeScript
const lines = newLevels.map((l) => {
  const lettersStr = l.letters.map((c) => `'${c}'`).join(', ')
  return `  { letters: [${lettersStr}], center: '${l.center}', target: ${l.target} },`
})

console.log(`// Generated ${newLevels.length} new levels`)
console.log(`// Valid word counts range: ${Math.min(...newLevels.map((l) => l.validCount))} - ${Math.max(...newLevels.map((l) => l.validCount))}`)
lines.forEach((l) => console.log(l))
