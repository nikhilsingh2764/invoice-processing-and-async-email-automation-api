// Error-report hook. It is a no-op until the owner wires a reporting service, and it
// scrubs PII (emails, long numbers, tokens) from anything that passes through it.
import { scrubPII } from './security.js'

let sink = null

export function setReportSink(fn) {
  sink = typeof fn === 'function' ? fn : null
}

export function report(error, context = {}) {
  if (!sink) return
  try {
    const message = scrubPII(error?.message || String(error))
    sink({ message, name: error?.name || 'Error', context: Object.keys(context) })
  } catch {
    /* reporting must never throw */
  }
}
