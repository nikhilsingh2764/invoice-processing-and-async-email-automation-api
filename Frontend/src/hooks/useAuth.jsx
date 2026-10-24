import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/endpoints.js'
import { http } from '../api/client.js'
import { normalizeError } from '../api/errors.js'
import { onAuthEvent, postAuthEvent } from '../lib/authChannel.js'
import { storage } from '../lib/storage.js'
import { safeNextPath } from '../lib/security.js'
import { report } from '../lib/report.js'

const AuthContext = createContext(null)

export class CookiesBlockedError extends Error {
  constructor() {
    super('Sign-in worked but your browser blocked the session cookie. Allow cookies for this site and try again.')
    this.name = 'CookiesBlockedError'
  }
}

/** status: loading | authed | anon | maintenance */
export function AuthProvider({ children }) {
  const qc = useQueryClient()
  const [state, setState] = useState({ status: 'loading', user: null, notice: '' })
  const alive = useRef(true)

  const clearSession = useCallback(
    ({ notice = '', rememberPath = false } = {}) => {
      if (rememberPath) {
        const here = safeNextPath(window.location.pathname + window.location.search)
        if (here && !here.startsWith('/login')) storage.set('ip.returnTo', here)
      }
      qc.clear()
      if (alive.current) setState({ status: 'anon', user: null, notice })
    },
    [qc],
  )

  const loadProfile = useCallback(async (signal) => {
    try {
      const user = await authApi.profile({ signal })
      if (alive.current) setState({ status: 'authed', user, notice: '' })
      return user
    } catch (error) {
      if (error?.code === 'ERR_CANCELED') return null
      const n = normalizeError(error)
      if (!alive.current) return null
      if (n.status === 401 || n.status === 403) setState({ status: 'anon', user: null, notice: '' })
      else if (n.status === 0 || n.status >= 500) setState((s) => (s.status === 'authed' ? s : { status: 'maintenance', user: null, notice: '' }))
      else setState({ status: 'anon', user: null, notice: '' })
      return null
    }
  }, [])

  useEffect(() => {
    alive.current = true
    const ctrl = new AbortController()
    http.setHandlers({
      onSessionExpired: () => clearSession({ notice: 'Your session ended. Sign in again to continue.', rememberPath: true }),
      onInactive: () => clearSession({ notice: 'This account is inactive.' }),
    })
    loadProfile(ctrl.signal)
    return () => {
      alive.current = false
      ctrl.abort()
    }
  }, [clearSession, loadProfile])

  // Other tabs: login revalidates, logout clears.
  useEffect(
    () =>
      onAuthEvent((type) => {
        if (type === 'logout') clearSession({ notice: 'You signed out in another tab.' })
        else loadProfile()
      }),
    [clearSession, loadProfile],
  )

  // Back/forward cache: a restored page must not show stale private data.
  useEffect(() => {
    const onShow = (e) => {
      if (e.persisted) loadProfile()
    }
    window.addEventListener('pageshow', onShow)
    return () => window.removeEventListener('pageshow', onShow)
  }, [loadProfile])

  const finishLogin = useCallback(async () => {
    const user = await loadProfile()
    if (!user) throw new CookiesBlockedError()
    postAuthEvent('login')
    return user
  }, [loadProfile])

  const login = useCallback(
    async (values) => {
      await authApi.login(values)
      return finishLogin()
    },
    [finishLogin],
  )

  const loginWithGoogle = useCallback(
    async (idToken) => {
      await authApi.google(idToken)
      return finishLogin()
    },
    [finishLogin],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (error) {
      report(error, { where: 'logout' })
    }
    postAuthEvent('logout')
    clearSession()
  }, [clearSession])

  const setUser = useCallback((user) => setState((s) => ({ ...s, user })), [])
  const dismissNotice = useCallback(() => setState((s) => ({ ...s, notice: '' })), [])
  const retry = useCallback(() => {
    setState({ status: 'loading', user: null, notice: '' })
    return loadProfile()
  }, [loadProfile])

  const value = useMemo(
    () => ({ ...state, login, loginWithGoogle, logout, clearSession, setUser, dismissNotice, retry, refreshProfile: loadProfile }),
    [state, login, loginWithGoogle, logout, clearSession, setUser, dismissNotice, retry, loadProfile],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
