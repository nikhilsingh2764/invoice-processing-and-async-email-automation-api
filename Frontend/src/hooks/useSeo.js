import { useEffect } from 'react'
import { SITE } from '../config/site.js'

function setMeta(selector, attr, value) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement(selector.startsWith('link') ? 'link' : 'meta')
    const m = selector.match(/\[(\w+(?::\w+)?)="([^"]+)"\]/)
    if (m) el.setAttribute(m[1], m[2])
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

/** Per-page title, description, canonical, Open Graph and Twitter tags, plus optional JSON-LD. Plain data only, no HTML. */
export function useSeo({ title, description, path = '/', jsonLd, noindex = false }) {
  useEffect(() => {
    const full = title ? `${title} · ${SITE.name}` : `${SITE.name}: ${SITE.tagline}`
    document.title = full
    const url = `${SITE.url}${path}`
    setMeta('meta[name="description"]', 'content', description)
    setMeta('link[rel="canonical"]', 'href', url)
    setMeta('meta[property="og:title"]', 'content', full)
    setMeta('meta[property="og:description"]', 'content', description)
    setMeta('meta[property="og:url"]', 'content', url)
    setMeta('meta[name="twitter:title"]', 'content', full)
    setMeta('meta[name="twitter:description"]', 'content', description)
    setMeta('meta[name="robots"]', 'content', noindex ? 'noindex, nofollow' : 'index, follow')
    let script
    if (jsonLd) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }
    return () => script?.remove()
  }, [title, description, path, jsonLd, noindex])
}

/** App and auth pages: keep them out of search indexes (robots.txt alone does not remove them). */
export function useNoIndex() {
  useEffect(() => {
    const el = document.createElement('meta')
    el.name = 'robots'
    el.content = 'noindex, nofollow'
    document.head.appendChild(el)
    return () => el.remove()
  }, [])
}
