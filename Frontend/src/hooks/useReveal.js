import { useEffect, useRef } from 'react'

/** Adds `data-in` once the element enters the viewport. Styles only animate when motion is allowed. */
export function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (typeof IntersectionObserver === 'undefined') {
      el.dataset.in = 'true'
      return undefined
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.dataset.in = 'true'
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}
