import { useSyncExternalStore } from 'react'

export function useMediaQuery(query) {
  const subscribe = (cb) => {
    const mq = window.matchMedia(query)
    mq.addEventListener('change', cb)
    return () => mq.removeEventListener('change', cb)
  }
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
}

export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')
