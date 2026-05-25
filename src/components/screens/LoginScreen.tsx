import { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import Logo from '../Logo'

interface LoginScreenProps {
  onClose: () => void
}

export default function LoginScreen({ onClose }: LoginScreenProps) {
  const { signInWithGoogle, signInWithApple, error, clearError, user } =
    useAuth()
  const [visible, setVisible] = useState(false)
  const [signingIn, setSigningIn] = useState<'google' | 'apple' | null>(null)
  const dialogRef = useFocusTrap<HTMLDivElement>(visible)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  useEffect(() => {
    if (user) {
      handleClose()
    }
  }, [user])

  const handleClose = useCallback(() => {
    clearError()
    setVisible(false)
    setTimeout(onClose, 200)
  }, [onClose, clearError])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleClose])

  async function handleGoogle() {
    setSigningIn('google')
    await signInWithGoogle()
    setSigningIn(null)
  }

  async function handleApple() {
    setSigningIn('apple')
    await signInWithApple()
    setSigningIn(null)
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
      aria-label="Giris yap"
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

        {/* Logo & Baslik */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3">
            <Logo />
          </div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">
            Giris Yap
          </h2>
          <p className="mt-1.5 text-sm text-surface-400">
            Satin alimlarini koru, ilerlemeni senkronize et
          </p>
        </div>

        {/* Hata */}
        {error && (
          <div className="mb-4 rounded-xl bg-error-500/10 px-4 py-3 text-center text-sm text-error-500">
            {error}
          </div>
        )}

        {/* Giris butonlari */}
        <div className="space-y-3">
          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={signingIn !== null}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-surface-200 bg-white px-4 py-3.5 text-sm font-semibold text-surface-700 transition-all hover:bg-surface-50 active:scale-[0.98] disabled:opacity-60 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200 dark:hover:bg-surface-700"
          >
            {signingIn === 'google' ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-surface-300 border-t-primary-500" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Google ile giris yap
          </button>

          {/* Apple */}
          <button
            onClick={handleApple}
            disabled={signingIn !== null}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-black px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-900 active:scale-[0.98] disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-100"
          >
            {signingIn === 'apple' ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-white dark:border-gray-300 dark:border-t-black" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
            )}
            Apple ile giris yap
          </button>
        </div>

        {/* Daha sonra */}
        <button
          onClick={handleClose}
          className="mt-5 w-full text-center text-sm font-medium text-surface-400 transition-colors hover:text-surface-600 dark:hover:text-surface-300"
        >
          Daha sonra
        </button>
      </div>
    </div>
  )
}
