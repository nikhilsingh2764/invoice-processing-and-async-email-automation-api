import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import { TopProgress } from '../components/ui/TopProgress.jsx'
import { OfflineBanner, LegacyBanner, CookieBanner, MockBanner, useServiceWorker } from '../components/layout/Banners.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { setReportSink } from '../lib/report.js'

/** Root of the router: skip link, progress bar, global banners, focus management on navigation. */
export default function Root() {
  const loc = useLocation()
  const toast = useToast()
  const { updateReady, applyUpdate } = useServiceWorker()

  useEffect(() => setReportSink?.(null), [])

  // After a route change, move focus to the page heading (or main) so screen readers announce the new page.
  useEffect(() => {
    const t = setTimeout(() => {
      const h = document.getElementById('page-title') || document.querySelector('main h1') || document.getElementById('main')
      if (h) {
        if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1')
        h.focus({ preventScroll: true })
      }
    }, 0)
    return () => clearTimeout(t)
  }, [loc.pathname])

  useEffect(() => {
    if (updateReady) toast.push({ type: 'info', title: 'A new version is ready', duration: 0, action: { label: 'Reload', onClick: applyUpdate } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateReady])

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <TopProgress />
      <OfflineBanner />
      <LegacyBanner />
      <MockBanner />
      <Outlet />
      <CookieBanner />
      <ScrollRestoration />
    </>
  )
}
