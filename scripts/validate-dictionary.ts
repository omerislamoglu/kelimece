/**
 * Validates that all words in the dictionary are properly
 * Turkish-lowercase (no uppercase, correct İ/I handling).
 *
 * Run: npx tsx scripts/validate-dictionary.ts
 */

import { WORDS } from '../src/data/words'

let errors = 0

for (const word of WORDS) {
  const normalized = word.toLocaleLowerCase('tr-TR')
  if (word !== normalized) {
    console.error(`BAD: "${word}" → should be "${normalized}"`)
    errors++
  }

  // Check for common Turkish uppercase remnants
  if (/[A-ZÇĞİÖŞÜ]/.test(word)) {
    console.error(`UPPERCASE CHAR: "${word}"`)
    errors++
  }

  // Specifically check for wrong I/İ mapping
  if (word.includes('I')) {
    console.error(`WRONG I (should be ı): "${word}"`)
    errors++
  }
}

if (errors === 0) {
  console.log(`All ${WORDS.length} words are valid Turkish lowercase.`)
} else {
  console.error(`\nFound ${errors} issue(s) in the dictionary.`)
  process.exit(1)
}
