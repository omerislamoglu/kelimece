import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const wordsFile = readFileSync(
  resolve(__dirname, '../src/data/words.ts'),
  'utf-8',
)
const WORDS: string[] = []
const regex = /'([^']+)'/g
let match: RegExpExecArray | null
while ((match = regex.exec(wordsFile)) !== null) {
  WORDS.push(match[1])
}

function normalizeWord(w: string): string {
  return w.toLocaleLowerCase('tr-TR').trim()
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

function findValidWordCount(letters: string[], center: string): number {
  return WORDS.filter((w) => canFormWord(normalizeWord(w), letters, center))
    .length
}

const levelsPath = resolve(__dirname, '../src/data/levels.ts')
let content = readFileSync(levelsPath, 'utf-8')

const MAX_RATIO = 0.75
let fixed = 0

const levelRegex =
  /\{\s*letters:\s*\[([^\]]+)\],\s*center:\s*'([^']+)',\s*target:\s*(\d+)\s*\}/g

content = content.replace(levelRegex, (fullMatch, lettersStr, center, targetStr) => {
  const letters = lettersStr
    .replace(/'/g, '')
    .split(',')
    .map((s: string) => s.trim())
  const target = parseInt(targetStr, 10)
  const validCount = findValidWordCount(letters, center)

  if (validCount > 0 && target / validCount > MAX_RATIO) {
    const newTarget = Math.max(Math.floor(validCount * MAX_RATIO), Math.min(target, 3))
    if (newTarget !== target) {
      fixed++
      console.log(`Fixed: target ${target} → ${newTarget} (${validCount} valid words)`)
      return fullMatch.replace(`target: ${target}`, `target: ${newTarget}`)
    }
  }
  return fullMatch
})

writeFileSync(levelsPath, content)
console.log(`\nDone: fixed ${fixed} levels`)
