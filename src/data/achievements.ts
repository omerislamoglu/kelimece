export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  target: number
  reward: number
  secret?: boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  // ── Başlangıç ────────────────────────────────────────────────────────────────
  {
    id: 'first_word',
    title: 'İlk Adım',
    description: 'İlk kelimeni bul',
    icon: 'sparkles',
    target: 1,
    reward: 10,
  },
  {
    id: 'words_10',
    title: 'Kelime Meraklısı',
    description: '10 kelime bul',
    icon: 'book-open',
    target: 10,
    reward: 20,
  },
  {
    id: 'words_50',
    title: 'Kelime Avcısı',
    description: '50 kelime bul',
    icon: 'target',
    target: 50,
    reward: 30,
  },
  {
    id: 'words_100',
    title: 'Sözlük',
    description: '100 farklı kelime bul',
    icon: 'library',
    target: 100,
    reward: 50,
  },
  {
    id: 'words_500',
    title: 'Kelime Ustası',
    description: '500 kelime bul',
    icon: 'crown',
    target: 500,
    reward: 100,
  },

  // ── Bulmaca ──────────────────────────────────────────────────────────────────
  {
    id: 'level_1',
    title: 'Çırak',
    description: 'İlk bulmacayı tamamla',
    icon: 'flag',
    target: 1,
    reward: 10,
  },
  {
    id: 'level_10',
    title: 'Deneyimli',
    description: '10 bulmaca tamamla',
    icon: 'award',
    target: 10,
    reward: 50,
  },
  {
    id: 'level_50',
    title: 'Bulmaca Gurusu',
    description: '50 bulmaca tamamla',
    icon: 'trophy',
    target: 50,
    reward: 100,
  },
  {
    id: 'perfect_1',
    title: 'Mükemmel',
    description: 'Bir bulmacada tüm kelimeleri bul',
    icon: 'star',
    target: 1,
    reward: 50,
  },
  {
    id: 'perfect_10',
    title: 'Kusursuz',
    description: '10 mükemmel bulmaca tamamla',
    icon: 'gem',
    target: 10,
    reward: 100,
  },

  // ── Pangram ──────────────────────────────────────────────────────────────────
  {
    id: 'pangram_1',
    title: 'Tam Kelime!',
    description: 'İlk pangramını bul',
    icon: 'zap',
    target: 1,
    reward: 20,
  },
  {
    id: 'pangram_5',
    title: 'Pangram Ustası',
    description: '5 pangram bul',
    icon: 'flame',
    target: 5,
    reward: 50,
  },
  {
    id: 'pangram_20',
    title: 'Pangram Efsanesi',
    description: '20 pangram bul',
    icon: 'rocket',
    target: 20,
    reward: 100,
  },

  // ── Bonus ────────────────────────────────────────────────────────────────────
  {
    id: 'bonus_10',
    title: 'Bonus Avcısı',
    description: '10 bonus kelime bul',
    icon: 'gift',
    target: 10,
    reward: 30,
  },
  {
    id: 'bonus_50',
    title: 'Bonus Koleksiyoncu',
    description: '50 bonus kelime bul',
    icon: 'package',
    target: 50,
    reward: 75,
  },

  // ── Streak ───────────────────────────────────────────────────────────────────
  {
    id: 'streak_3',
    title: 'Üç Günlük',
    description: '3 gün üst üste oyna',
    icon: 'calendar',
    target: 3,
    reward: 30,
  },
  {
    id: 'streak_7',
    title: 'Düzenli Oyuncu',
    description: '7 gün üst üste oyna',
    icon: 'calendar-check',
    target: 7,
    reward: 100,
  },
  {
    id: 'streak_30',
    title: 'Bağımlı',
    description: '30 gün üst üste oyna',
    icon: 'heart',
    target: 30,
    reward: 200,
  },

  // ── Topluluk ─────────────────────────────────────────────────────────────────
  {
    id: 'report_5',
    title: 'Cömert',
    description: '5 kelime bildir',
    icon: 'message-circle',
    target: 5,
    reward: 30,
  },

  // ── İpucu ────────────────────────────────────────────────────────────────────
  {
    id: 'no_hint',
    title: 'İlham',
    description: 'İpucu kullanmadan bir bulmacayı bitir',
    icon: 'brain',
    target: 1,
    reward: 75,
  },

  // ── Gizli ────────────────────────────────────────────────────────────────────
  {
    id: 'night_owl',
    title: 'Gece Kuşu',
    description: 'Gece 00-04 arası oyna',
    icon: 'moon',
    target: 1,
    reward: 50,
    secret: true,
  },
  {
    id: 'long_word',
    title: 'Uzun Lafın Kısası',
    description: '7 harfli bir kelime bul',
    icon: 'ruler',
    target: 1,
    reward: 30,
    secret: true,
  },
]

export const ACHIEVEMENT_MAP = new Map(ACHIEVEMENTS.map((a) => [a.id, a]))
