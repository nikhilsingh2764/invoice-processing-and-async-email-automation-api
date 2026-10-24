import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { storage } from '../lib/storage.js'

const ThemeContext = createContext(null)
const systemDark = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches

function apply(theme, density) {
  const root = document.documentElement
  const resolved = theme === 'system' ? (systemDark() ? 'dark' : 'light') : theme
  root.dataset.theme = resolved
  root.dataset.density = density
  root.style.colorScheme = resolved
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#14110d' : '#fbf8f2')
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => storage.get('ip.theme') || 'system')
  const [density, setDensityState] = useState(() => storage.get('ip.density') || 'comfortable')

  useEffect(() => {
    apply(theme, density)
    if (theme !== 'system') return undefined
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const on = () => apply('system', density)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [theme, density])

  const setTheme = useCallback((v) => {
    storage.set('ip.theme', v)
    setThemeState(v)
  }, [])
  const setDensity = useCallback((v) => {
    storage.set('ip.density', v)
    setDensityState(v)
  }, [])

  const value = useMemo(() => ({ theme, setTheme, density, setDensity }), [theme, setTheme, density, setDensity])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
