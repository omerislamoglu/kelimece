/**
 * RevenueCat IAP servisi — Consumable jeton paketleri
 *
 * Kelimece'de 4 jeton paketi var (consumable):
 * - coins_100: 100 jeton — ₺9.99
 * - coins_300: 300 jeton — ₺24.99
 * - coins_700: 700 jeton — ₺49.99
 * - coins_1500: 1500 jeton — ₺89.99
 *
 * RevenueCat Dashboard'da:
 * 1. Kelimece icin yeni proje olustur
 * 2. iOS App → App Store Connect'ten bagla
 * 3. Products: 4 consumable urun ekle (App Store Connect'te de tanimla)
 * 4. Offering: "default" offering olustur, 4 paketi ekle
 */

import { Capacitor } from '@capacitor/core'

// ── RevenueCat API Key ──────────────────────────────────────────────────────

const REVENUECAT_IOS_KEY = '' // TODO: RevenueCat Dashboard → API Keys → iOS key

// ── Product ID'leri (App Store Connect'te tanimlanacak) ─────────────────────

export const PRODUCT_IDS: Record<string, string> = {
  coins_100: 'app.kelimece.coins100',
  coins_300: 'app.kelimece.coins300',
  coins_700: 'app.kelimece.coins700',
  coins_1500: 'app.kelimece.coins1500',
}

// ── State ────────────────────────────────────────────────────────────────────

let sdkConfigured = false
let currentUserId: string | undefined

// Dinamik import — sadece native'de yukle
type PurchasesPlugin = typeof import('@revenuecat/purchases-capacitor').Purchases
let _purchases: PurchasesPlugin | null = null

async function getPurchases(): Promise<PurchasesPlugin | null> {
  if (!Capacitor.isNativePlatform()) return null
  if (_purchases) return _purchases

  try {
    const mod = await import('@revenuecat/purchases-capacitor')
    _purchases = mod.Purchases
    return _purchases
  } catch {
    console.warn('[RC] Plugin yuklenemedi')
    return null
  }
}

// ── Initialize ──────────────────────────────────────────────────────────────

export async function initRevenueCat(userId?: string): Promise<void> {
  const Purchases = await getPurchases()
  if (!Purchases) return

  try {
    if (!sdkConfigured) {
      const { LOG_LEVEL } = await import('@revenuecat/purchases-capacitor')
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG })
      await Purchases.configure({ apiKey: REVENUECAT_IOS_KEY })
      sdkConfigured = true
      console.log('[RC] Baslatildi')
    }

    if (userId && userId !== currentUserId) {
      await Purchases.logIn({ appUserID: userId })
      currentUserId = userId
      console.log('[RC] Kullanici girisi:', userId)
    }
  } catch (e) {
    console.error('[RC] Init hatasi:', e)
  }
}

// ── Logout ──────────────────────────────────────────────────────────────────

export async function logOutRevenueCat(): Promise<void> {
  const Purchases = await getPurchases()
  if (!Purchases || !sdkConfigured) return

  try {
    await Purchases.logOut()
    currentUserId = undefined
  } catch {
    currentUserId = undefined
  }
}

// ── SDK hazir mi? ───────────────────────────────────────────────────────────

export function isRCReady(): boolean {
  return sdkConfigured
}

/** RC SDK hazir olana kadar bekle — max 10 saniye */
export function waitForRC(): Promise<boolean> {
  return new Promise((resolve) => {
    if (sdkConfigured) {
      resolve(true)
      return
    }
    let elapsed = 0
    const iv = setInterval(() => {
      elapsed += 250
      if (sdkConfigured) {
        clearInterval(iv)
        resolve(true)
        return
      }
      if (elapsed >= 10000) {
        clearInterval(iv)
        resolve(false)
      }
    }, 250)
  })
}

// ── Satin alma sonucu ───────────────────────────────────────────────────────

export type PurchaseResult =
  | { success: true; coins: number }
  | { success: false; cancelled: boolean; error: string }

// ── Fiyat bilgisi ───────────────────────────────────────────────────────────

export interface ProductPrice {
  productId: string
  priceString: string
  price: number
}

/**
 * App Store'dan gercek fiyatlari cek.
 * Basarisiz olursa bos dizi doner — UI yerel fiyatlari gosterir.
 */
export async function fetchPrices(): Promise<ProductPrice[]> {
  const Purchases = await getPurchases()
  if (!Purchases || !sdkConfigured) return []

  try {
    const offerings = await Purchases.getOfferings()
    const offering =
      offerings.current ??
      Object.values(offerings.all ?? {})[0] ??
      null

    if (!offering) return []

    return offering.availablePackages.map((pkg) => ({
      productId: pkg.product.identifier,
      priceString: pkg.product.priceString,
      price: pkg.product.price,
    }))
  } catch (e) {
    console.warn('[RC] Fiyat cekme hatasi:', e)
    return []
  }
}

// ── Consumable satin alma ───────────────────────────────────────────────────

/**
 * Jeton paketi satin al.
 * @param packageId - COIN_PACKAGES'teki id (coins_100, coins_300, vb.)
 * @param coins - Kazanilacak jeton miktari
 */
export async function purchaseCoins(
  packageId: string,
  coins: number,
): Promise<PurchaseResult> {
  const Purchases = await getPurchases()

  if (!Purchases || !Capacitor.isNativePlatform()) {
    return { success: false, cancelled: false, error: 'Native platform gerekli' }
  }

  if (!sdkConfigured) {
    const ready = await waitForRC()
    if (!ready) {
      return { success: false, cancelled: false, error: 'RevenueCat hazir degil' }
    }
  }

  try {
    // Offering'den paketi bul
    const offerings = await Purchases.getOfferings()
    const offering =
      offerings.current ??
      Object.values(offerings.all ?? {})[0] ??
      null

    if (!offering) {
      return { success: false, cancelled: false, error: 'Urun bulunamadi' }
    }

    const productId = PRODUCT_IDS[packageId]
    const pkg = offering.availablePackages.find(
      (p) => p.product.identifier === productId,
    )

    if (!pkg) {
      return {
        success: false,
        cancelled: false,
        error: `Paket bulunamadi: ${productId}`,
      }
    }

    console.log('[RC] Satin alma baslatiliyor:', pkg.identifier, pkg.product.priceString)

    await Purchases.purchasePackage({ aPackage: pkg })

    console.log('[RC] Satin alma basarili — +' + coins + ' jeton')
    return { success: true, coins }
  } catch (e: any) {
    const code = String(e?.code ?? '')
    const message = String(e?.message ?? e ?? '')

    if (
      code === '1' ||
      e?.userCancelled === true ||
      message.toLowerCase().includes('cancel')
    ) {
      return { success: false, cancelled: true, error: 'Iptal edildi' }
    }

    console.error('[RC] Satin alma hatasi:', code, message)
    return { success: false, cancelled: false, error: message || 'Bilinmeyen hata' }
  }
}

// ── Restore ─────────────────────────────────────────────────────────────────

export async function restorePurchases(): Promise<boolean> {
  const Purchases = await getPurchases()
  if (!Purchases || !sdkConfigured) return false

  try {
    await Purchases.restorePurchases()
    console.log('[RC] Restore tamamlandi')
    return true
  } catch (e) {
    console.error('[RC] Restore hatasi:', e)
    return false
  }
}
