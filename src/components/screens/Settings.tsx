import { useEffect, useState, useCallback } from 'react'
import { X, Monitor, Sun, Moon } from 'lucide-react'
import type { Theme } from '../../hooks/useTheme'
import {
  isSoundEnabled,
  setSoundEnabled,
  isVibrationEnabled,
  setVibrationEnabled,
} from '../../lib/sounds'
import { STORAGE_KEYS } from '../../lib/constants'

interface SettingsProps {
  theme: Theme
  onThemeChange: (theme: Theme) => void
  onShowTutorial: () => void
  onShowStats: () => void
  onShowAchievements: () => void
  onClose: () => void
}

function Toggle({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={() => onChange(!enabled)}
      className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
        enabled
          ? 'bg-primary-600 dark:bg-accent-500'
          : 'bg-surface-300 dark:bg-surface-700'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

const THEME_OPTIONS: { value: Theme; label: string; Icon: typeof Monitor }[] = [
  { value: 'system', label: 'Sistem', Icon: Monitor },
  { value: 'light', label: 'Acik', Icon: Sun },
  { value: 'dark', label: 'Koyu', Icon: Moon },
]

export default function Settings({
  theme,
  onThemeChange,
  onShowTutorial,
  onShowStats,
  onShowAchievements,
  onClose,
}: SettingsProps) {
  const [visible, setVisible] = useState(false)
  const [sound, setSound] = useState(isSoundEnabled)
  const [vibration, setVibration] = useState(isVibrationEnabled)
  const [autoDefs, setAutoDefs] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.autoDefinitions) === 'true'
    } catch {
      return false
    }
  })

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

  function handleSoundToggle(v: boolean) {
    setSound(v)
    setSoundEnabled(v)
  }

  function handleVibrationToggle(v: boolean) {
    setVibration(v)
    setVibrationEnabled(v)
  }

  function handleAutoDefsToggle(v: boolean) {
    setAutoDefs(v)
    try {
      localStorage.setItem(STORAGE_KEYS.autoDefinitions, String(v))
    } catch {
      // ignore
    }
  }

  function handleTutorial() {
    handleClose()
    setTimeout(onShowTutorial, 250)
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
      aria-label="Ayarlar"
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

        <h2 className="mb-5 text-center text-xl font-bold text-surface-900 dark:text-surface-100">
          Ayarlar
        </h2>

        {/* Tema */}
        <div className="mb-5">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-surface-400">
            Tema
          </label>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => onThemeChange(value)}
                className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 text-xs font-medium transition-all ${
                  theme === value
                    ? 'bg-primary-600 text-white shadow-md dark:bg-accent-500'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Togglelar */}
        <div className="mb-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Ses efektleri
            </span>
            <Toggle
              enabled={sound}
              onChange={handleSoundToggle}
              label="Ses efektleri"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Titresim
            </span>
            <Toggle
              enabled={vibration}
              onChange={handleVibrationToggle}
              label="Titresim"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                Tanimlari otomatik goster
              </span>
              <p className="text-xs text-surface-400">
                Kelime bulununca anlamini goster
              </p>
            </div>
            <Toggle
              enabled={autoDefs}
              onChange={handleAutoDefsToggle}
              label="Tanimlari otomatik goster"
            />
          </div>
        </div>

        {/* Linkler */}
        <div className="mb-5 space-y-2">
          <button
            onClick={handleTutorial}
            className="w-full rounded-xl bg-surface-100 px-4 py-3 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
          >
            Nasil oynanir?
          </button>
          <button
            onClick={() => {
              handleClose()
              setTimeout(onShowStats, 250)
            }}
            className="w-full rounded-xl bg-surface-100 px-4 py-3 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
          >
            Istatistikler
          </button>
          <button
            onClick={() => {
              handleClose()
              setTimeout(onShowAchievements, 250)
            }}
            className="w-full rounded-xl bg-surface-100 px-4 py-3 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
          >
            Basarilar
          </button>
        </div>

        {/* Alt bilgi */}
        <div className="border-t border-surface-200 pt-4 text-center dark:border-surface-800">
          <a
            href="mailto:omeris343212@gmail.com?subject=Kelimece%20Geri%20Bildirim"
            className="text-xs font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-accent-400 dark:hover:text-accent-300"
          >
            Geri bildirim gonder
          </a>
          <p className="mt-2 text-[11px] text-surface-400">Kelimece v1.0.0</p>
        </div>
      </div>
    </div>
  )
}
