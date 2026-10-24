// Security helpers. Pure functions, no side effects, fully unit-tested.

const MAX_URL_LENGTH = 2048
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F]/

/**
 * Validates a URL that came from data (for example the business logo).
 * Returns the normalised URL string, or null when it is not allowed.
 * Only https is allowed; http is accepted for localhost during development.
 */
export function safeUrl(input, { dev = Boolean(import.meta.env?.DEV) } = {}) {
  if (typeof input !== 'string') return null
  const value = input.trim()
  if (!value || value.length > MAX_URL_LENGTH || CONTROL_CHARS.test(value)) return null
  let url
  try {
    url = new URL(value)
  } catch {
    return null
  }
  if (url.protocol === 'https:') return url.href
  if (dev && url.protocol === 'http:' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) return url.href
  return null
}

/**
 * Validates a post-login return path. Only same-origin relative paths pass.
 * Rejects protocol-relative URLs, backslashes, schemes, control characters and
 * encoded variants of all of those. Returns the path or null.
 */
export function safeNextPath(input) {
  if (typeof input !== 'string') return null
  let value = input
  if (value.length === 0 || value.length > 512) return null
  // Decode up to three times so %252f style double encoding cannot slip through.
  for (let i = 0; i < 3; i += 1) {
    if (!isCleanPath(value)) return null
    let decoded
    try {
      decoded = decodeURIComponent(value)
    } catch {
      return null
    }
    if (decoded === value) break
    value = decoded
  }
  if (!isCleanPath(value)) return null
  return input
}

function isCleanPath(value) {
  if (!value.startsWith('/')) return false
  if (value.startsWith('//')) return false
  if (value.includes('\\')) return false
  if (CONTROL_CHARS.test(value)) return false
  if (/^\/+[a-z][a-z0-9+.-]*:/i.test(value)) return false
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return false
  return true
}

/** Keeps only [A-Za-z0-9._-] so a download name can never contain a path or markup. */
export function safeFilename(name, fallback = 'invoice') {
  const cleaned = String(name ?? '')
    .replace(/[^A-Za-z0-9._-]/g, '')
    .replace(/^\.+/, '')
    .slice(0, 80)
  return cleaned || fallback
}

/** Escapes regex metacharacters (the server applies `search` as a regular expression). */
export function escapeRegex(value) {
  return String(value ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** True when the buffer begins with the %PDF- magic bytes. */
export function isPdfBytes(buffer) {
  if (!buffer) return false
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  if (bytes.length < 5) return false
  return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d
}

/** Removes emails, long digit runs and bearer tokens from text before it is reported anywhere. */
export function scrubPII(text) {
  return String(text ?? '')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/\b\d{6,}\b/g, '[number]')
    .replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, '[token]')
}

export function clampInt(value, min, max, fallback) {
  const n = Number.parseInt(value, 10)
  if (Number.isNaN(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

/** Truncates untrusted text (for example an HTML error page from a proxy) to plain, short text. */
export function plainSnippet(value, max = 200) {
  const text = String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? `${text.slice(0, max)}…` : text
}
