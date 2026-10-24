import { http } from './client.js'
import { isPdfBytes, safeFilename } from '../lib/security.js'
import { PDF_POLL } from '../config/features.js'
import { normalizeError } from './errors.js'

export class PdfTimeoutError extends Error {
  constructor() {
    super('The PDF is taking longer than expected.')
    this.name = 'PdfTimeoutError'
  }
}
export class PdfInvalidError extends Error {
  constructor() {
    super('The server did not return a valid PDF file.')
    this.name = 'PdfInvalidError'
  }
}

async function requestOnce(id, signal) {
  const res = await http.get(`/invoice/${encodeURIComponent(id)}/pdf`, { responseType: 'arraybuffer', signal, validateStatus: (s) => s === 200 || s === 202 })
  if (res.status === 202) return { kind: 'queued', jobId: res.data && typeof res.data === 'object' ? res.data.jobId : undefined }
  const type = String(res.headers?.['content-type'] || '')
  if (!type.includes('application/pdf') || !isPdfBytes(res.data)) throw new PdfInvalidError()
  return { kind: 'pdf', bytes: res.data }
}

const defaultSleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(t)
        reject(Object.assign(new Error('canceled'), { code: 'ERR_CANCELED' }))
      },
      { once: true },
    )
  })

async function jobState(jobId, signal) {
  const res = await http.get(`/invoice/pdf/status/${encodeURIComponent(jobId)}`, { signal })
  return String(res.data?.status ?? 'unknown')
}

/**
 * Requests the PDF. A 200 returns bytes at once. A 202 means a job is queued: when the server gave a jobId the job
 * status route is polled (every 1.5 s, up to 30 times) and the PDF is fetched once the job completes, so only ONE job
 * is ever queued. Without a jobId (or if the status route is missing) the same URL is polled instead.
 * `onAttempt(n)` reports polling progress.
 */
export async function fetchInvoicePdf(id, { signal, onAttempt, sleep = defaultSleep, interval = PDF_POLL.intervalMs, maxAttempts = PDF_POLL.maxAttempts } = {}) {
  const first = await requestOnce(id, signal)
  if (first.kind === 'pdf') return first.bytes
  let useStatus = Boolean(first.jobId)
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    onAttempt?.(attempt)
    await sleep(interval, signal)
    if (useStatus) {
      try {
        const state = await jobState(first.jobId, signal)
        if (state === 'failed') throw new PdfInvalidError()
        if (state !== 'completed') continue
      } catch (error) {
        if (error instanceof PdfInvalidError || error?.code === 'ERR_CANCELED') throw error
        useStatus = false // status route unavailable: fall back to polling the PDF URL itself
      }
    }
    const next = await requestOnce(id, signal)
    if (next.kind === 'pdf') return next.bytes
  }
  throw new PdfTimeoutError()
}

/** State machine: idle, requesting, polling, success, timeout, error. */
export const initialPdfState = { phase: 'idle', attempt: 0, message: '' }

export function pdfReducer(state, action) {
  switch (action.type) {
    case 'start':
      return { phase: 'requesting', attempt: 0, message: '' }
    case 'poll':
      return state.phase === 'requesting' || state.phase === 'polling' ? { phase: 'polling', attempt: action.attempt, message: '' } : state
    case 'success':
      return { phase: 'success', attempt: state.attempt, message: '' }
    case 'timeout':
      return { phase: 'timeout', attempt: state.attempt, message: 'The PDF is taking longer than expected. Try again in a moment.' }
    case 'error':
      return { phase: 'error', attempt: state.attempt, message: action.message || 'Could not prepare the PDF.' }
    case 'reset':
      return initialPdfState
    default:
      return state
  }
}

export function pdfErrorMessage(error) {
  if (error instanceof PdfTimeoutError || error instanceof PdfInvalidError) return error.message
  return normalizeError(error).message || 'Could not prepare the PDF.'
}

/** Saves bytes through an anchor (never an iframe) and revokes the object URL straight away. */
export function savePdf(bytes, invoiceNumber) {
  if (!isPdfBytes(bytes)) throw new PdfInvalidError()
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${safeFilename(invoiceNumber)}.pdf`
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
