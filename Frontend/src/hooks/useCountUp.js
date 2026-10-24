import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from './useMediaQuery.js'

/** Animates a number once on mount; returns the final value at once under reduced motion. */
export function useCountUp(target, { duration = 700 } = {}) {
  const reduced = usePrefersReducedMotion()
  const [value, setValue] = useState(reduced ? target : 0)
  useEffect(() => {
    if (reduced) {
      setValue(target)
      return undefined
    }
    let raf
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      setValue(target * (1 - (1 - t) ** 3))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, reduced])
  return value
}
