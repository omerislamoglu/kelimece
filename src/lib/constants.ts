export const MIN_WORD_LENGTH = 4
export const PUZZLE_LETTER_COUNT = 7
export const MIN_VALID_WORDS = 15
export const PANGRAM_BONUS = 7

export const COIN_PER_WORD = 10
export const COIN_PER_PANGRAM = 20
export const COIN_PER_BONUS = 5
export const HINT_COST = 50
export const INITIAL_COINS = 100

export const STORAGE_KEYS = {
  game: 'kelimece-game',
  stats: 'kelimece-stats',
  theme: 'kelimece-theme',
  sound: 'kelimece-sound',
  vibration: 'kelimece-vibration',
  tutorial: 'kelimece-tutorial-completed',
  coins: 'kelimece-coins',
} as const

export const COIN_PACKAGES = [
  { id: 'coins_100', coins: 100, price: 9.99, label: 'Kucuk Paket' },
  {
    id: 'coins_300',
    coins: 300,
    price: 24.99,
    label: 'Orta Paket',
    popular: true,
  },
  { id: 'coins_700', coins: 700, price: 49.99, label: 'Buyuk Paket' },
  {
    id: 'coins_1500',
    coins: 1500,
    price: 89.99,
    label: 'Mega Paket',
    best: true,
  },
] as const

export type CoinPackage = (typeof COIN_PACKAGES)[number]

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
