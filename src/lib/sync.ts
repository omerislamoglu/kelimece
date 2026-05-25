/**
 * Firestore veri senkronizasyonu
 *
 * Strateji:
 * - Giris yapildiginda: Firestore'dan oku → yerel ile birlesir (max deger) → ikisine de yaz
 * - Veri degistiginde: 3 saniye debounce ile Firestore'a push et
 * - Cakisma cozumu: Sayisal degerlerde max, tarih/string'lerde en anlamli olan
 */

import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, auth } from './firebase'
import { getStats, updateStats, type GameStats } from './stats'
import { loadProgress, saveProgress, type LevelProgress } from './levels'
// achievements.ts dinamik import olarak kullanilir (chunk splitting icin)
// import { getUnlockedIds } from './achievements'
import { STORAGE_KEYS, INITIAL_COINS } from './constants'

// ── Firestore veri yapisi ─────────────────────────────────────────────────────

interface CloudData {
  coins: number
  stats: GameStats
  progress: LevelProgress
  achievements: string[]
  noHintLevels: number[]
  lastSync: number
}

// ── Yerel veri okuma/yazma yardimcilari ──────────────────────────────────────

function loadCoins(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.coins)
    if (!raw) return INITIAL_COINS
    const parsed = JSON.parse(raw)
    return typeof parsed === 'number' && Number.isFinite(parsed) && parsed >= 0
      ? parsed
      : INITIAL_COINS
  } catch {
    return INITIAL_COINS
  }
}

function saveCoinsLocal(coins: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.coins, JSON.stringify(coins))
  } catch {
    /* ignore */
  }
}

function loadNoHintLevels(): number[] {
  try {
    const raw = localStorage.getItem('kelimece-no-hint-levels')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAchievementsLocal(ids: string[]): void {
  try {
    localStorage.setItem('kelimece-achievements', JSON.stringify(ids))
  } catch {
    /* ignore */
  }
}

function saveNoHintLocal(levels: number[]): void {
  try {
    localStorage.setItem('kelimece-no-hint-levels', JSON.stringify(levels))
  } catch {
    /* ignore */
  }
}

// ── Birlestirme (merge) fonksiyonlari ────────────────────────────────────────

function mergeStats(local: GameStats, remote: GameStats): GameStats {
  return {
    levelsCompleted: Math.max(local.levelsCompleted, remote.levelsCompleted),
    totalStars: Math.max(local.totalStars, remote.totalStars),
    perfectLevels: Math.max(local.perfectLevels, remote.perfectLevels),
    totalWordsFound: Math.max(local.totalWordsFound, remote.totalWordsFound),
    totalBonusWords: Math.max(local.totalBonusWords, remote.totalBonusWords),
    totalPangrams: Math.max(local.totalPangrams, remote.totalPangrams),
    coinsEarned: Math.max(local.coinsEarned, remote.coinsEarned),
    coinsSpent: Math.max(local.coinsSpent, remote.coinsSpent),
    hintsUsed: Math.max(local.hintsUsed, remote.hintsUsed),
    longestWordFound:
      local.longestWordFound.length >= remote.longestWordFound.length
        ? local.longestWordFound
        : remote.longestWordFound,
    firstPlayDate:
      local.firstPlayDate && remote.firstPlayDate
        ? local.firstPlayDate < remote.firstPlayDate
          ? local.firstPlayDate
          : remote.firstPlayDate
        : local.firstPlayDate || remote.firstPlayDate,
    lastPlayDate:
      local.lastPlayDate > remote.lastPlayDate
        ? local.lastPlayDate
        : remote.lastPlayDate,
    playStreak: Math.max(local.playStreak, remote.playStreak),
    longestPlayStreak: Math.max(
      local.longestPlayStreak,
      remote.longestPlayStreak,
    ),
  }
}

function mergeProgress(
  local: LevelProgress,
  remote: LevelProgress,
): LevelProgress {
  const completedSet = new Set([
    ...local.completedLevels,
    ...remote.completedLevels,
  ])

  const mergedStars: Record<number, number> = { ...remote.levelStars }
  for (const [k, v] of Object.entries(local.levelStars)) {
    const key = Number(k)
    mergedStars[key] = Math.max(mergedStars[key] ?? 0, v)
  }

  const totalStars = Object.values(mergedStars).reduce(
    (sum, s) => sum + s,
    0,
  )

  return {
    currentLevel: Math.max(local.currentLevel, remote.currentLevel),
    completedLevels: [...completedSet].sort((a, b) => a - b),
    totalStars,
    levelStars: mergedStars,
  }
}

// ── Ana sync fonksiyonlari ───────────────────────────────────────────────────

/**
 * Giris yapildiginda cagirilir.
 * Firestore'dan veri ceker, yerel ile birlestirir, ikisine de yazar.
 * Birlesme tamamlaninca 'kelimece:synced' eventi firlatir.
 */
export async function syncFromCloud(): Promise<void> {
  const uid = auth.currentUser?.uid
  if (!uid) return

  try {
    const docRef = doc(db, 'users', uid)
    const snapshot = await getDoc(docRef)

    const localCoins = loadCoins()
    const localStats = getStats()
    const localProgress = loadProgress()
    const { getUnlockedIds } = await import('./achievements')
    const localAchievements = [...getUnlockedIds()]
    const localNoHint = loadNoHintLevels()

    if (snapshot.exists()) {
      const remote = snapshot.data() as Partial<CloudData>

      // Birlesir
      const mergedCoins = Math.max(localCoins, remote.coins ?? 0)
      const mergedStats = remote.stats
        ? mergeStats(localStats, remote.stats)
        : localStats
      const mergedProgress = remote.progress
        ? mergeProgress(localProgress, remote.progress)
        : localProgress
      const mergedAchievements = [
        ...new Set([...localAchievements, ...(remote.achievements ?? [])]),
      ]
      const mergedNoHint = [
        ...new Set([...localNoHint, ...(remote.noHintLevels ?? [])]),
      ]

      // Yerel kaydet
      saveCoinsLocal(mergedCoins)
      updateStats(mergedStats)
      saveProgress(mergedProgress)
      saveAchievementsLocal(mergedAchievements)
      saveNoHintLocal(mergedNoHint)

      // Firestore'a birlesmis veriyi yaz
      await setDoc(
        docRef,
        {
          coins: mergedCoins,
          stats: mergedStats,
          progress: mergedProgress,
          achievements: mergedAchievements,
          noHintLevels: mergedNoHint,
          lastSync: Date.now(),
        },
        { merge: true },
      )

      console.log('[Sync] Cloud verisi birlestirildi.')
    } else {
      // Firestore'da veri yok — yerel veriyi push et
      await setDoc(docRef, {
        coins: localCoins,
        stats: localStats,
        progress: localProgress,
        achievements: localAchievements,
        noHintLevels: localNoHint,
        lastSync: Date.now(),
      })

      console.log('[Sync] Yerel veri cloud\'a yazildi (ilk sync).')
    }

    // Arayuzu guncelle
    window.dispatchEvent(new Event('kelimece:synced'))
  } catch (e) {
    console.warn('[Sync] Cloud sync basarisiz:', e)
  }
}

// ── Debounced push ───────────────────────────────────────────────────────────

let syncTimeout: ReturnType<typeof setTimeout> | undefined

/**
 * Veri degistiginde cagirilir.
 * 3 saniye bekleyip Firestore'a push eder (debounce).
 */
export function scheduleSyncToCloud(): void {
  const uid = auth.currentUser?.uid
  if (!uid) return

  clearTimeout(syncTimeout)
  syncTimeout = setTimeout(() => {
    pushToCloud().catch((e) =>
      console.warn('[Sync] Push basarisiz:', e),
    )
  }, 3000)
}

async function pushToCloud(): Promise<void> {
  const uid = auth.currentUser?.uid
  if (!uid) return

  await setDoc(
    doc(db, 'users', uid),
    {
      coins: loadCoins(),
      stats: getStats(),
      progress: loadProgress(),
      achievements: await import('./achievements').then((m) => [...m.getUnlockedIds()]),
      noHintLevels: loadNoHintLevels(),
      lastSync: Date.now(),
    },
    { merge: true },
  )
}

/**
 * Aninda push (bekleme yok).
 * Onemli islemlerden sonra cagirilir (satin alma, bolum tamamlama vs.)
 */
export async function forceSyncToCloud(): Promise<void> {
  clearTimeout(syncTimeout)
  await pushToCloud().catch((e) =>
    console.warn('[Sync] Force push basarisiz:', e),
  )
}
