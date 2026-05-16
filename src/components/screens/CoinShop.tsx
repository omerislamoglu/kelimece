import { useEffect, useState, useCallback } from 'react'
import { X, Coins, Sparkles, Crown, Zap } from 'lucide-react'
import { COIN_PACKAGES, type CoinPackage } from '../../lib/constants'

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
  const [visible, setVisible] = useState(false)
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
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

  const handlePurchase = useCallback(
    (pkg: CoinPackage) => {
      setPurchasing(pkg.id)
      // Capacitor IAP placeholder — gercek odeme entegrasyonu sonra eklenecek
      setTimeout(() => {
        onPurchase(pkg.coins)
        setPurchasing(null)
      }, 1500)
    },
    [onPurchase],
  )

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
                disabled={isPurchasing}
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
                      {'\u20BA'}
                      {pkg.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Alt bilgi */}
        <p className="mt-4 text-center text-[11px] text-surface-400">
          Satin alimlar geri iade edilemez. Odeme islemi Capacitor IAP
          entegrasyonu ile gerceklestirilecektir.
        </p>
      </div>
    </div>
  )
}
