import { useEffect } from 'react'
import { SITE } from '../config/site.js'

/** Sets the tab title; also used by the route announcer for screen readers. */
export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title
    document.title = title ? `${title} · ${SITE.name}` : SITE.name
    return () => {
      document.title = previous
    }
  }, [title])
}
