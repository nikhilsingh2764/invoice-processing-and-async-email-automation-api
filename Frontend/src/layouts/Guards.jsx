import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth.jsx'
import { Splash } from '../components/layout/Splash.jsx'
import { MaintenanceScreen } from '../components/layout/ErrorScreens.jsx'
import { safeNextPath } from '../lib/security.js'
import { storage } from '../lib/storage.js'

/** App routes: anonymous visitors go to /login with a validated `next`. */
export function RequireAuth() {
  const { status, retry } = useAuth()
  const loc = useLocation()
  if (status === 'loading') return <Splash />
  if (status === 'maintenance') return <MaintenanceScreen onRetry={retry} />
  if (status === 'anon') {
    const next = safeNextPath(loc.pathname + loc.search)
    return <Navigate to={next && next !== '/' ? `/login?next=${encodeURIComponent(next)}` : '/login'} replace />
  }
  return <Outlet />
}

/** Public and auth routes: signed-in users go straight to where they were headed. */
export function PublicOnly({ redirectHome = true }) {
  const { status } = useAuth()
  const loc = useLocation()
  if (status === 'loading') return <Splash />
  if (status === 'authed' && redirectHome) {
    const next = safeNextPath(new URLSearchParams(loc.search).get('next')) || storage.get('ip.returnTo') || '/dashboard'
    if (storage.get('ip.returnTo')) storage.remove?.('ip.returnTo')
    return <Navigate to={next === '/' ? '/dashboard' : next} replace />
  }
  return <Outlet />
}
