import { plainSnippet } from '../lib/security.js'

export const MESSAGES = {
  network: "Can't reach the server. Check your connection.",
  timeout: 'The request took too long. Try again.',
  rateLimit: 'Too many attempts, try again in a few minutes.',
  server: 'Something went wrong on our side. Try again.',
  unknown: 'Something went wrong. Try again.',
}

export const TOKEN_MESSAGES = ['Authentication token is required', 'Invalid authentication token', 'Authentication token has expired']

/** Extracts { path: message } from `errors: [{path|field, msg|message}]` or `errors: { field: message }`. */
export function extractFieldErrors(body) {
  const out = {}
  const errors = body?.errors
  if (Array.isArray(errors)) {
    for (const e of errors) {
      const path = e?.path ?? e?.field ?? e?.param
      const msg = e?.msg ?? e?.message
      if (path && msg && !out[path]) out[String(path)] = plainSnippet(msg, 200)
    }
  } else if (errors && typeof errors === 'object') {
    for (const [k, v] of Object.entries(errors)) if (typeof v === 'string' && !out[k]) out[k] = plainSnippet(v, 200)
  }
  return out
}

/** One shape for every failure: { status, message, detail, fieldErrors, isNetwork, isTimeout, isRateLimit, isCanceled }. */
export function normalizeError(error) {
  if (error?.normalized) return error.normalized
  const response = error?.response
  const status = response?.status ?? 0
  const body = response?.data && typeof response.data === 'object' ? response.data : null
  const serverMessage = body?.message ? plainSnippet(body.message, 200) : typeof response?.data === 'string' ? plainSnippet(response.data, 200) : ''
  const isCanceled = error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError'
  const isTimeout = !response && (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT')
  const isNetwork = !response && !isTimeout && !isCanceled
  const isRateLimit = status === 429

  let message
  let detail = ''
  if (isCanceled) message = ''
  else if (isTimeout) message = MESSAGES.timeout
  else if (isNetwork) message = MESSAGES.network
  else if (isRateLimit) {
    message = MESSAGES.rateLimit
    detail = serverMessage
  } else if (status >= 500) {
    message = MESSAGES.server
    detail = serverMessage
  } else message = serverMessage || MESSAGES.unknown

  return { status, message, serverMessage, detail, fieldErrors: extractFieldErrors(body), isNetwork, isTimeout, isRateLimit, isCanceled }
}

export const errorMessage = (error) => normalizeError(error).message
