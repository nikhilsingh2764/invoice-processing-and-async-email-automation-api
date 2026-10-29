import axios from 'axios'
import { API_BASE_URL, SEND_CSRF_HEADER } from '../config/env.js'
import { TOKEN_MESSAGES, normalizeError } from './errors.js'
import { plainSnippet } from '../lib/security.js'

export const NO_REFRESH_PATHS = ['/login', '/signup', '/verify-otp', '/forgot-password', '/reset-password', '/google', '/refresh-token', '/logout']

const pathOf = (url = '') => String(url).split('?')[0]
const isBinary = (data) => data instanceof ArrayBuffer || (typeof Blob !== 'undefined' && data instanceof Blob)

async function decodeBody(data) {
  try {
    const buffer = data instanceof Blob ? await data.arrayBuffer() : data
    const text = new TextDecoder('utf-8', { fatal: false }).decode(buffer)
    try {
      return JSON.parse(text)
    } catch {
      return plainSnippet(text, 200)
    }
  } catch {
    return null
  }
}

/**
 * Builds an axios instance with the refresh-once interceptor.
 * `handlers.onSessionExpired` and `handlers.onInactive` are injected by the auth provider.
 */
export function createClient({ baseURL = API_BASE_URL, csrf = SEND_CSRF_HEADER, handlers = {}, adapter } = {}) {
  const state = { handlers, refreshPromise: null }

  const instance = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 20000,
    allowAbsoluteUrls: false,
    // The UI matches a few English server messages (token errors, lockout). The server localises messages from
    // Accept-Language (en/hi), so pin English: a Hindi browser would otherwise break the refresh flow.
    headers: { Accept: 'application/json', 'Accept-Language': 'en' },
    ...(adapter ? { adapter } : {}),
  })

  instance.interceptors.request.use((config) => {
    const method = String(config.method || 'get').toLowerCase()
    // Fixed: Set X-Requested-With to 'XMLHttpRequest' to satisfy backend security guard
    if (csrf && method !== 'get' && method !== 'head' && method !== 'options') {
      config.headers.set('X-Requested-With', 'XMLHttpRequest')
    }
    return config
  })

  // Single-flight: concurrent 401s wait behind ONE refresh call.
  function refresh() {
    if (!state.refreshPromise) {
      state.refreshPromise = instance
        .post('/refresh-token', null)
        .then(() => true)
        .finally(() => {
          state.refreshPromise = null
        })
    }
    return state.refreshPromise
  }

  instance.interceptors.response.use(
    (response) => {
      // A 200 that carries a web page (the SPA's index.html) means /api is not reaching the backend: a missing proxy
      // rule or wrong VITE_API_BASE_URL. Without this check every list silently parses to "empty" and the dashboard shows zeros.
      if (typeof response.data === 'string' && /^\s*<(!doctype|html)/i.test(response.data)) {
        const error = new Error('API returned a web page instead of JSON')
        error.config = response.config
        error.response = response
        error.normalized = {
          status: 502,
          message: 'Cannot reach the API: the server answered with a web page instead of data. Check the API proxy rule or VITE_API_BASE_URL.',
          serverMessage: '',
          detail: '',
          fieldErrors: {},
          isNetwork: true,
          isTimeout: false,
          isRateLimit: false,
          isCanceled: false,
        }
        throw error
      }
      return response
    },
    async (error) => {
      const config = error.config
      if (error.response && isBinary(error.response.data)) error.response.data = await decodeBody(error.response.data)
      error.normalized = normalizeError(error)
      const status = error.response?.status
      const message = error.response?.data?.message

      const refreshable = status === 401 && config && !config._retried && TOKEN_MESSAGES.includes(message) && !NO_REFRESH_PATHS.includes(pathOf(config.url))

      if (refreshable) {
        config._retried = true
        try {
          await refresh()
        } catch (refreshError) {
          if (refreshError?.response?.status === 403 && /inactive/i.test(refreshError.response?.data?.message || '')) state.handlers.onInactive?.()
          else state.handlers.onSessionExpired?.()
          error.sessionExpired = true
          throw error
        }
        return instance(config)
      }

      if (status === 403 && /inactive/i.test(message || '')) state.handlers.onInactive?.()
      throw error
    },
  )

  instance.setHandlers = (next) => {
    state.handlers = { ...state.handlers, ...next }
  }
  return instance
}

export const http = createClient()
export const unwrap = (response) => response?.data?.data