export const MIN_WORD_LENGTH = 4
export const PUZZLE_LETTER_COUNT = 7
export const MIN_VALID_WORDS = 15
export const PANGRAM_BONUS = 7

export const STORAGE_KEYS = {
  game: 'kelimece-game',
  stats: 'kelimece-stats',
  theme: 'kelimece-theme',
  sound: 'kelimece-sound',
  vibration: 'kelimece-vibration',
  tutorial: 'kelimece-tutorial-completed',
} as const

export const RANKS = [
  { threshold: 0, label: 'Başlangıç' },
  { threshold: 0.05, label: 'Çırak' },
  { threshold: 0.15, label: 'Heveskar' },
  { threshold: 0.3, label: 'İyi' },
  { threshold: 0.45, label: 'Usta' },
  { threshold: 0.6, label: 'Üstat' },
  { threshold: 0.75, label: 'Uzman' },
  { threshold: 0.9, label: 'Dahi' },
] as const
