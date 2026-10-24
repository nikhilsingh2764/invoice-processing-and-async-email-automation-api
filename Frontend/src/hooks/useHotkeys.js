import { useEffect, useRef } from 'react'

const isTyping = (el) => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))

/**
 * Registers global shortcuts. `map` keys: "mod+k", "?", "g d" (two-key sequence).
 * Single-character shortcuts are ignored while typing (WCAG 2.1.4).
 */
export function useHotkeys(map) {
  const ref = useRef(map)
  ref.current = map
  useEffect(() => {
    let pending = null
    let timer = null
    const onKey = (e) => {
      if (e.defaultPrevented || e.isComposing) return
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      const mod = e.metaKey || e.ctrlKey
      if (mod && key === 'k' && ref.current['mod+k']) {
        e.preventDefault()
        ref.current['mod+k'](e)
        return
      }
      if (mod || e.altKey || isTyping(e.target)) return
      if (pending) {
        const combo = `${pending} ${key}`
        clearTimeout(timer)
        pending = null
        if (ref.current[combo]) {
          e.preventDefault()
          ref.current[combo](e)
        }
        return
      }
      if (key === 'g') {
        pending = 'g'
        timer = setTimeout(() => (pending = null), 900)
        return
      }
      if (ref.current[key]) {
        e.preventDefault()
        ref.current[key](e)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearTimeout(timer)
    }
  }, [])
}
