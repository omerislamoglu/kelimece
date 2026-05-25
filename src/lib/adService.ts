/**
 * AdMob reklam servisi — Capacitor native platformda calisir.
 *
 * Reklam turleri:
 * - Interstitial: Bolum tamamlandiktan sonra gosterilir (her 3 bolumde 1)
 * - Rewarded: Kullanici izleyerek ucretsiz jeton kazanir
 */

import { Capacitor } from '@capacitor/core'

// ── Test / Production mod ────────────────────────────────────────────────────

export const IS_TESTING = true // Production'da false yap

// Test reklam ID'leri (Google'in resmi test ID'leri)
const TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/4411468910'
const TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/1712485313'

// Production reklam ID'leri — AdMob'dan alinacak
const PROD_INTERSTITIAL_ID = 'ca-app-pub-1423547441369432/5985295748'
const PROD_REWARDED_ID = 'ca-app-pub-1423547441369432/9141256364'

const INTERSTITIAL_ID = IS_TESTING ? TEST_INTERSTITIAL_ID : PROD_INTERSTITIAL_ID
const REWARDED_ID = IS_TESTING ? TEST_REWARDED_ID : PROD_REWARDED_ID

// ── State ────────────────────────────────────────────────────────────────────

let admobReady = false
let interstitialLoaded = false
let rewardedLoaded = false
let levelsPlayed = 0

// Tip tanımlari — dinamik import oldugu icin burada tutuyoruz
type AdMobPlugin = typeof import('@capacitor-community/admob').AdMob

let _admob: AdMobPlugin | null = null

// ── AdMob dinamik import (sadece native'de yukle) ───────────────────────────

async function getAdMob(): Promise<AdMobPlugin | null> {
  if (!Capacitor.isNativePlatform()) return null
  if (_admob) return _admob

  try {
    const mod = await import('@capacitor-community/admob')
    _admob = mod.AdMob
    return _admob
  } catch {
    console.warn('[AdMob] Plugin yuklenemedi')
    return null
  }
}

// ── Baslatma ─────────────────────────────────────────────────────────────────

export async function initAdMob(): Promise<void> {
  const AdMob = await getAdMob()
  if (!AdMob) return

  try {
    await AdMob.initialize({ initializeForTesting: IS_TESTING })
    admobReady = true
    console.log('[AdMob] Baslatildi')

    // Interstitial listener'lari
    const { InterstitialAdPluginEvents } = await import(
      '@capacitor-community/admob'
    )
    AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
      interstitialLoaded = true
    })
    AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, () => {
      interstitialLoaded = false
    })
    AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
      interstitialLoaded = false
      // Sonraki reklami yukle
      setTimeout(() => loadInterstitial(), 1000)
    })

    // Rewarded listener'lari
    const { RewardAdPluginEvents } = await import(
      '@capacitor-community/admob'
    )
    AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
      rewardedLoaded = true
    })
    AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => {
      rewardedLoaded = false
    })

    // Ilk reklamlari yukle
    await loadInterstitial()
    await loadRewarded()
  } catch (e) {
    console.warn('[AdMob] Baslatma hatasi:', e)
  }
}

// ── Interstitial ─────────────────────────────────────────────────────────────

async function loadInterstitial(): Promise<void> {
  const AdMob = await getAdMob()
  if (!AdMob || !admobReady) return

  try {
    await AdMob.prepareInterstitial({
      adId: INTERSTITIAL_ID,
      isTesting: IS_TESTING,
    })
  } catch {
    console.warn('[AdMob] Interstitial yuklenemedi')
  }
}

/**
 * Bolum tamamlandiktan sonra cagirilir.
 * Her 3 bolumde 1 reklam gosterir.
 */
export async function showInterstitialIfReady(): Promise<boolean> {
  levelsPlayed++

  // Her 3 bolumde 1 goster
  if (levelsPlayed % 3 !== 0) return false

  const AdMob = await getAdMob()
  if (!AdMob || !admobReady || !interstitialLoaded) return false

  try {
    await AdMob.showInterstitial()
    interstitialLoaded = false
    return true
  } catch {
    console.warn('[AdMob] Interstitial gosterilemedi')
    loadInterstitial()
    return false
  }
}

// ── Rewarded ─────────────────────────────────────────────────────────────────

async function loadRewarded(): Promise<void> {
  const AdMob = await getAdMob()
  if (!AdMob || !admobReady) return

  try {
    await AdMob.prepareRewardVideoAd({
      adId: REWARDED_ID,
      isTesting: IS_TESTING,
    })
  } catch {
    console.warn('[AdMob] Rewarded yuklenemedi')
  }
}

/**
 * Odul reklamini goster.
 * Kullanici reklami tamamen izlerse true doner (jeton ver).
 */
export async function showRewardedAd(): Promise<boolean> {
  const AdMob = await getAdMob()
  if (!AdMob || !admobReady || !rewardedLoaded) return false

  const { RewardAdPluginEvents } = await import('@capacitor-community/admob')

  return new Promise<boolean>((resolve) => {
    let rewarded = false

    const rewardListener = AdMob.addListener(
      RewardAdPluginEvents.Rewarded,
      () => {
        rewarded = true
      },
    )

    const closeListener = AdMob.addListener(
      RewardAdPluginEvents.Dismissed,
      () => {
        rewardListener.then((l) => l.remove())
        closeListener.then((l) => l.remove())
        rewardedLoaded = false
        setTimeout(() => loadRewarded(), 1000)
        resolve(rewarded)
      },
    )

    AdMob.showRewardVideoAd().catch(() => {
      rewardListener.then((l) => l.remove())
      closeListener.then((l) => l.remove())
      loadRewarded()
      resolve(false)
    })
  })
}

/**
 * Rewarded reklam hazir mi?
 */
export function isRewardedReady(): boolean {
  return admobReady && rewardedLoaded
}

/**
 * Reklam izleyerek kazanilan jeton miktari.
 */
export const REWARDED_COIN_AMOUNT = 30
