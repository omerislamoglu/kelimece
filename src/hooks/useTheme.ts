import { useState, useEffect, useCallback } from 'react'

export type Theme = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'kelimece-theme'

function getStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system')
    return stored
  return 'system'
}

function getSystemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(theme: Theme) {
  const isDark = theme === 'dark' || (theme === 'system' && getSystemDark())
  document.documentElement.classList.toggle('dark', isDark)

  // Body arka planini da guncelle
  document.body.style.backgroundColor = isDark ? '#020617' : '#f8fafc'
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    localStorage.setItem(STORAGE_KEY, t)
    applyTheme(t)
  }, [])

  // Ilk yukleme ve tema degisikligi
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // System tema degisikligini dinle
  useEffect(() => {
    if (theme !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  return { theme, setTheme }
}
