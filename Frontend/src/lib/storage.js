// The ONLY module allowed to touch localStorage or sessionStorage (enforced by ESLint).
// Every key is registered with a purpose, category, lifetime and validator. The Cookie and
// Storage Policy page renders its table from STORAGE_REGISTRY, so the policy cannot drift.
// Tokens and user objects are never stored: authentication lives in HttpOnly cookies.

import { safeNextPath } from './security.js'

export const STORAGE_REGISTRY = [
  { key: 'ip.theme', store: 'local', purpose: 'Remembers whether you chose the light, dark or system theme.', category: 'Preference', lifetime: 'Until you clear site data', validate: (v) => ['light', 'dark', 'system'].includes(v) },
  { key: 'ip.density', store: 'local', purpose: 'Remembers the Comfortable or Compact table density.', category: 'Preference', lifetime: 'Until you clear site data', validate: (v) => ['comfortable', 'compact'].includes(v) },
  { key: 'ip.sidebar', store: 'local', purpose: 'Remembers whether the sidebar is collapsed.', category: 'Preference', lifetime: 'Until you clear site data', validate: (v) => ['collapsed', 'expanded'].includes(v) },
  { key: 'ip.pageSize', store: 'local', purpose: 'Remembers your preferred number of rows per table page.', category: 'Preference', lifetime: 'Until you clear site data', validate: (v) => ['10', '25', '50', '100'].includes(v) },
  { key: 'ip.notice.storage', store: 'local', purpose: 'Remembers that you saw the storage notice.', category: 'Essential', lifetime: 'Until you clear site data', validate: (v) => v === 'ack' },
  { key: 'ip.notice.cache', store: 'local', purpose: 'Remembers that you hid the "dashboard totals can take a while to update" notice.', category: 'Preference', lifetime: 'Until you clear site data', validate: (v) => v === 'hidden' },
  { key: 'ip.notice.checklist', store: 'local', purpose: 'Remembers that you dismissed the first-run setup checklist.', category: 'Preference', lifetime: 'Until you clear site data', validate: (v) => v === 'hidden' },
  { key: 'ip.notice.policies', store: 'local', purpose: 'Remembers which version of the policies you were told about.', category: 'Essential', lifetime: 'Until you clear site data', validate: (v) => /^[0-9-]{10}$/.test(v) },
  { key: 'ip.returnTo', store: 'session', purpose: 'Remembers the page you were on when your session ended, so you return there after signing in.', category: 'Essential', lifetime: 'Until you close the tab', validate: (v) => safeNextPath(v) !== null },
]

const registryByKey = new Map(STORAGE_REGISTRY.map((entry) => [entry.key, entry]))
const TOKEN_LIKE = /eyJ[\w-]+\.[\w-]+\./
const MAX_VALUE_LENGTH = 512

function area(store) {
  try {
    return store === 'session' ? window.sessionStorage : window.localStorage
  } catch {
    return null
  }
}

function entryFor(key) {
  const entry = registryByKey.get(key)
  if (!entry) throw new Error(`Storage key "${key}" is not registered in src/lib/storage.js`)
  return entry
}

export const storage = {
  registry: STORAGE_REGISTRY,

  get(key) {
    const entry = entryFor(key)
    const target = area(entry.store)
    if (!target) return null
    try {
      const value = target.getItem(key)
      if (value === null) return null
      if (!entry.validate(value)) {
        target.removeItem(key)
        return null
      }
      return value
    } catch {
      return null
    }
  },

  set(key, value) {
    const entry = entryFor(key)
    const text = String(value)
    if (text.length > MAX_VALUE_LENGTH || TOKEN_LIKE.test(text) || !entry.validate(text)) return false
    const target = area(entry.store)
    if (!target) return false
    try {
      target.setItem(key, text)
      return true
    } catch {
      return false
    }
  },

  remove(key) {
    const entry = entryFor(key)
    const target = area(entry.store)
    if (!target) return
    try {
      target.removeItem(key)
    } catch {
      /* storage blocked: nothing to remove */
    }
  },
}
