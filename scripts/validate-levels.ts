import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Load words ────────────────────────────────────────────────────────────────
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
const WORD_SET = new Set(WORDS)

// ── Load levels ───────────────────────────────────────────────────────────────
const levelsFile = readFileSync(
  resolve(__dirname, '../src/data/levels.ts'),
  'utf-8',
)

interface LevelData {
  letters: string[]
  center: string
  target: number
}

const levels: LevelData[] = []
const levelRegex =
  /\{\s*letters:\s*\[([^\]]+)\],\s*center:\s*'([^']+)',\s*target:\s*(\d+)\s*\}/g
let lm: RegExpExecArray | null
while ((lm = levelRegex.exec(levelsFile)) !== null) {
  const letters = lm[1]
    .replace(/'/g, '')
    .split(',')
    .map((s) => s.trim())
  const center = lm[2]
  const target = parseInt(lm[3], 10)
  levels.push({ letters, center, target })
}

// ── Validation logic (mirrors src/lib/dictionary.ts) ──────────────────────────
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

function findAllValidWords(letters: string[], center: string): string[] {
  return WORDS.filter((w) => canFormWord(normalizeWord(w), letters, center))
}

function findPangrams(words: string[], letters: string[]): string[] {
  const letterSet = new Set(letters)
  return words.filter((word) => {
    const wordLetters = new Set(word)
    return [...letterSet].every((l) => wordLetters.has(l))
  })
}

// ── Run validation ────────────────────────────────────────────────────────────
let totalErrors = 0
let totalWarnings = 0

console.log(`Validating ${levels.length} levels against ${WORDS.length} words...\n`)

for (let i = 0; i < levels.length; i++) {
  const level = levels[i]
  const levelNum = i + 1
  const errors: string[] = []
  const warnings: string[] = []

  // 1. Check center letter is in letters array
  if (!level.letters.includes(level.center)) {
    errors.push(`Center letter '${level.center}' is not in letters array [${level.letters.join(',')}]`)
  }

  // 2. Check exactly 7 letters
  if (level.letters.length !== 7) {
    errors.push(`Expected 7 letters, got ${level.letters.length}: [${level.letters.join(',')}]`)
  }

  // 3. Check for duplicate letters
  const letterSet = new Set(level.letters)
  if (letterSet.size !== level.letters.length) {
    errors.push(`Duplicate letters in [${level.letters.join(',')}]`)
  }

  // 4. Find valid words
  const validWords = findAllValidWords(level.letters, level.center)

  // 5. Check valid word count vs target
  if (validWords.length < level.target) {
    errors.push(
      `Target is ${level.target} but only ${validWords.length} valid words found: [${validWords.join(', ')}]`,
    )
  }

  // 6. Check all valid words are actually in the dictionary
  for (const w of validWords) {
    if (!WORD_SET.has(w)) {
      errors.push(`Word "${w}" found as valid but NOT in WORDS dictionary`)
    }
  }

  // 7. Check no valid words are missed (words in dict that should match but don't)
  // This is inherently covered by findAllValidWords scanning all WORDS

  // 8. Warn if too few words (playability)
  if (validWords.length < 3) {
    warnings.push(`Only ${validWords.length} valid words — may be too hard/unplayable`)
  }

  // 9. Warn if target is very close to total (hard to complete without finding almost all)
  if (validWords.length > 0 && level.target / validWords.length > 0.9) {
    warnings.push(
      `Target ${level.target}/${validWords.length} — players must find >90% of words`,
    )
  }

  // 10. Check pangrams exist
  const pangrams = findPangrams(validWords, level.letters)
  if (pangrams.length === 0) {
    warnings.push(`No pangram possible for this level`)
  }

  if (errors.length > 0) {
    console.log(`❌ Level ${levelNum}: ${errors.length} error(s)`)
    for (const e of errors) console.log(`   ERROR: ${e}`)
    totalErrors += errors.length
  }

  if (warnings.length > 0) {
    console.log(`⚠️  Level ${levelNum}: ${warnings.length} warning(s)`)
    for (const w of warnings) console.log(`   WARN: ${w}`)
    totalWarnings += warnings.length
  }
}

console.log(`\n${'─'.repeat(60)}`)
console.log(`SUMMARY: ${levels.length} levels validated`)
console.log(`  ❌ Errors:   ${totalErrors}`)
console.log(`  ⚠️  Warnings: ${totalWarnings}`)

if (totalErrors === 0) {
  console.log(`\n✅ All levels are valid!`)
} else {
  console.log(`\n🚨 ${totalErrors} error(s) found — these levels need fixing!`)
  process.exit(1)
}
