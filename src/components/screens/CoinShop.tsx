import { useEffect, useState, useCallback, lazy, Suspense } from 'react'
import { X, Coins, Sparkles, Crown, Zap, Play, RotateCcw } from 'lucide-react'
import { COIN_PACKAGES, type CoinPackage } from '../../lib/constants'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useAuth } from '../../contexts/AuthContext'
import {
  showRewardedAd,
  isRewardedReady,
  REWARDED_COIN_AMOUNT,
} from '../../lib/adService'
import {
  purchaseCoins,
  restorePurchases,
  isRCReady,
  fetchPrices,
  type ProductPrice,
  PRODUCT_IDS,
} from '../../lib/revenueCat'
import { forceSyncToCloud } from '../../lib/sync'

const LoginScreen = lazy(() => import('./LoginScreen'))

interface CoinShopProps {
  coins: number
  onPurchase: (coins: number) => void
  onClose: () => void
}

const PACKAGE_ICONS = [Coins, Zap, Sparkles, Crown]

export default function CoinShop({
  coins,
  onPurchase,
  onClose,
}: CoinShopProps) {
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [pendingPkg, setPendingPkg] = useState<CoinPackage | null>(null)
  const [watchingAd, setWatchingAd] = useState(false)
  const [rewardedAvailable, setRewardedAvailable] = useState(isRewardedReady)
  const [restoring, setRestoring] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [storePrices, setStorePrices] = useState<ProductPrice[]>([])
  const dialogRef = useFocusTrap<HTMLDivElement>(visible && !showLogin)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  // App Store fiyatlarini cek
  useEffect(() => {
    if (isRCReady()) {
      fetchPrices().then(setStorePrices)
    }
  }, [])

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 200)
  }, [onClose])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleClose])

  // Gercek satin alma
  const doPurchase = useCallback(
    async (pkg: CoinPackage) => {
      setPurchasing(pkg.id)
      setPurchaseError(null)

      const result = await purchaseCoins(pkg.id, pkg.coins)

      if (result.success) {
        onPurchase(result.coins)
        forceSyncToCloud()
      } else if (!result.cancelled) {
        setPurchaseError(result.error)
        // 4 saniye sonra hata mesajini temizle
        setTimeout(() => setPurchaseError(null), 4000)
      }

      setPurchasing(null)
    },
    [onPurchase],
  )

  const handlePurchase = useCallback(
    (pkg: CoinPackage) => {
      if (!user) {
        setPendingPkg(pkg)
        setShowLogin(true)
        return
      }
      doPurchase(pkg)
    },
    [user, doPurchase],
  )

  useEffect(() => {
    if (user && pendingPkg) {
      setShowLogin(false)
      doPurchase(pendingPkg)
      setPendingPkg(null)
    }
  }, [user, pendingPkg, doPurchase])

  // Rewarded reklam durumunu kontrol et
  useEffect(() => {
    const interval = setInterval(() => {
      setRewardedAvailable(isRewardedReady())
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleWatchAd = useCallback(async () => {
    setWatchingAd(true)
    try {
      const rewarded = await showRewardedAd()
      if (rewarded) {
        onPurchase(REWARDED_COIN_AMOUNT)
      }
    } catch {
      // Reklam hatasi
    }
    setWatchingAd(false)
    setRewardedAvailable(isRewardedReady())
  }, [onPurchase])

  // Restore
  const handleRestore = useCallback(async () => {
    setRestoring(true)
    setPurchaseError(null)
    const restored = await restorePurchases()
    setRestoring(false)
    if (restored) {
      setPurchaseError(null)
    }
  }, [])

  // Fiyat gosterimi: App Store fiyati varsa onu goster, yoksa yerel fiyat
  function getPriceDisplay(pkg: CoinPackage): string {
    const productId = PRODUCT_IDS[pkg.id]
    const storePrice = storePrices.find((p) => p.productId === productId)
    if (storePrice) return storePrice.priceString
    return `₺${pkg.price.toFixed(2)}`
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Jeton Magazasi"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative w-full max-w-sm rounded-2xl bg-surface-50 p-6 shadow-2xl transition-all duration-200 dark:bg-surface-900 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Kapat */}
        <button
          onClick={handleClose}
          aria-label="Kapat"
          className="absolute right-4 top-4 rounded-lg p-1 text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Baslik */}
        <div className="mb-5 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
            <Coins className="h-6 w-6 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">
            Jeton Magazasi
          </h2>
          <p className="mt-1 text-sm text-surface-400">
            Mevcut: <span className="font-bold text-yellow-500">{coins}</span>{' '}
            jeton
          </p>
        </div>

        {/* Hata mesaji */}
        {purchaseError && (
          <div className="mb-4 rounded-xl bg-error-500/10 px-4 py-3 text-center text-sm text-error-500">
            {purchaseError}
          </div>
        )}

        {/* Ucretsiz jeton — reklam izle */}
        {rewardedAvailable && (
          <button
            onClick={handleWatchAd}
            disabled={watchingAd}
            aria-label="Reklam izleyerek ucretsiz jeton kazan"
            className="mb-4 flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-green-400 bg-green-500/5 px-4 py-3 text-left transition-all hover:bg-green-500/10 active:scale-[0.98] disabled:opacity-60 dark:border-green-500/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/20 text-green-500">
              {watchingAd ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-300 border-t-green-500" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-surface-900 dark:text-surface-100">
                  {REWARDED_COIN_AMOUNT}
                </span>
                <span className="text-xs font-medium text-surface-400">
                  jeton
                </span>
              </div>
              <span className="text-xs text-green-600 dark:text-green-400">
                Reklam izle — ucretsiz!
              </span>
            </div>
            <span className="rounded-lg bg-green-500 px-3 py-1.5 text-sm font-bold text-white">
              Izle
            </span>
          </button>
        )}

        {/* Paketler */}
        <div className="space-y-3">
          {COIN_PACKAGES.map((pkg, i) => {
            const Icon = PACKAGE_ICONS[i]
            const isPopular = 'popular' in pkg && pkg.popular
            const isBest = 'best' in pkg && pkg.best
            const isPurchasing = purchasing === pkg.id

            return (
              <button
                key={pkg.id}
                onClick={() => handlePurchase(pkg)}
                disabled={isPurchasing || purchasing !== null}
                aria-label={`${pkg.coins} jeton paketini satin al`}
                className={`relative flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all active:scale-[0.98] disabled:opacity-70 ${
                  isBest
                    ? 'border-yellow-400 bg-yellow-500/5 hover:bg-yellow-500/10 dark:border-yellow-500/50'
                    : isPopular
                      ? 'border-primary-300 bg-primary-500/5 hover:bg-primary-500/10 dark:border-accent-500/50'
                      : 'border-surface-200 bg-primary-50 hover:bg-primary-100 dark:border-surface-700 dark:bg-surface-800 dark:hover:bg-surface-800/80'
                }`}
              >
                {/* Badge */}
                {(isPopular || isBest) && (
                  <span
                    className={`absolute -top-2.5 right-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      isBest
                        ? 'bg-yellow-400 text-yellow-900'
                        : 'bg-primary-500 text-white dark:bg-accent-500'
                    }`}
                  >
                    {isBest ? 'En Avantajli' : 'Populer'}
                  </span>
                )}

                {/* Icon */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isBest
                      ? 'bg-yellow-400/20 text-yellow-500'
                      : isPopular
                        ? 'bg-primary-500/10 text-primary-500 dark:text-accent-400'
                        : 'bg-surface-100 text-surface-500 dark:bg-surface-700 dark:text-surface-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-surface-900 dark:text-surface-100">
                      {pkg.coins}
                    </span>
                    <span className="text-xs font-medium text-surface-400">
                      jeton
                    </span>
                  </div>
                  <span className="text-xs text-surface-400">{pkg.label}</span>
                </div>

                {/* Fiyat */}
                <div className="shrink-0">
                  {isPurchasing ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500/30 border-t-primary-500 dark:border-accent-500/30 dark:border-t-accent-500" />
                  ) : (
                    <span
                      className={`rounded-lg px-3 py-1.5 text-sm font-bold ${
                        isBest
                          ? 'bg-yellow-400 text-yellow-900'
                          : isPopular
                            ? 'bg-primary-600 text-white dark:bg-accent-500'
                            : 'bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-200'
                      }`}
                    >
                      {getPriceDisplay(pkg)}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Restore + Alt bilgi */}
        <div className="mt-4 text-center">
          <button
            onClick={handleRestore}
            disabled={restoring}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-accent-400 dark:hover:text-accent-300"
          >
            <RotateCcw
              className={`h-3.5 w-3.5 ${restoring ? 'animate-spin' : ''}`}
            />
            Satin almalari geri yukle
          </button>
          <p className="mt-2 text-[11px] text-surface-400">
            Satin alimlar Apple uzerinden islenircek.
          </p>
        </div>
      </div>

      {/* Login modal */}
      <Suspense fallback={null}>
        {showLogin && (
          <LoginScreen
            onClose={() => {
              setShowLogin(false)
              setPendingPkg(null)
            }}
          />
        )}
      </Suspense>
    </div>
  )
}
