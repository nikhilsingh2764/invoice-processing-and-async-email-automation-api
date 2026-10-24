import { useCallback, useEffect, useReducer, useRef } from 'react'
import { fetchInvoicePdf, initialPdfState, pdfErrorMessage, pdfReducer, PdfTimeoutError, savePdf } from '../api/pdf.js'
import { invoiceApi } from '../api/endpoints.js'
import { normalizeError } from '../api/errors.js'
import { EMAIL_POLL, FEATURES } from '../config/features.js'
import { useToast } from '../components/ui/Toast.jsx'
import { useDeleteInvoice } from './queries.js'
import { useQueryClient } from '@tanstack/react-query'
import { qk } from '../api/queryKeys.js'

/** PDF download state machine: idle -> requesting -> polling(n/30) -> success | timeout | error. */
export function usePdfDownload() {
  const [state, dispatch] = useReducer(pdfReducer, initialPdfState)
  const ctrl = useRef(null)
  useEffect(() => () => ctrl.current?.abort(), [])
  const start = useCallback(async (invoice) => {
    ctrl.current?.abort()
    const c = new AbortController()
    ctrl.current = c
    dispatch({ type: 'start' })
    try {
      const bytes = await fetchInvoicePdf(invoice.id, { signal: c.signal, onAttempt: (n) => dispatch({ type: 'poll', attempt: n }) })
      savePdf(bytes, invoice.invoiceNumber)
      dispatch({ type: 'success' })
    } catch (e) {
      if (e?.code === 'ERR_CANCELED') return
      dispatch(e instanceof PdfTimeoutError ? { type: 'timeout' } : { type: 'error', message: pdfErrorMessage(e) })
    }
  }, [])
  const busy = state.phase === 'requesting' || state.phase === 'polling'
  const label = state.phase === 'requesting' ? 'Preparing PDF…' : state.phase === 'polling' ? `Preparing PDF… (${state.attempt}/30)` : 'Download PDF'
  return { state, start, busy, label, reset: () => dispatch({ type: 'reset' }) }
}

/** Queues the email (202), then watches the job so the toast can say whether it was delivered. Never retried automatically. */
export function useEmailInvoice() {
  const toast = useToast()
  const timers = useRef(new Set())
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const watch = useCallback(
    (jobId, attempt = 1) => {
      const t = setTimeout(async () => {
        timers.current.delete(t)
        try {
          const status = await invoiceApi.emailStatus(jobId)
          if (status === 'completed') toast.success('Email sent', 'The invoice was delivered to your customer’s address.')
          else if (status === 'failed') toast.error('Email could not be sent', 'Check the customer’s email address, then try again.')
          else if (attempt < EMAIL_POLL.maxAttempts) watch(jobId, attempt + 1)
        } catch {
          /* status is a nicety; the queued toast already told the truth */
        }
      }, EMAIL_POLL.intervalMs)
      timers.current.add(t)
    },
    [toast],
  )
  return useCallback(
    async (invoice) => {
      try {
        const { jobId } = await invoiceApi.email(invoice.id)
        toast.success('Queued', 'Delivery happens in the background.')
        if (FEATURES.emailStatus && jobId) watch(jobId)
        return true
      } catch (e) {
        const n = normalizeError(e)
        toast.error('Could not queue the email', n.status === 429 ? 'You have reached the hourly email limit. Try again later.' : n.message)
        return false
      }
    },
    [toast, watch],
  )
}

/** Delete with undo (Command pattern): the row disappears at once, the real DELETE runs only when the undo toast expires. */
export function useUndoableDelete() {
  const qc = useQueryClient()
  const toast = useToast()
  const del = useDeleteInvoice()
  return useCallback(
    (invoice) => {
      const snapshot = qc.getQueriesData({ queryKey: qk.dashboardRoot() })
      const restore = () => snapshot.forEach(([key, data]) => qc.setQueryData(key, data))
      qc.setQueriesData({ queryKey: qk.dashboardRoot() }, (d) =>
        d?.invoices
          ? { ...d, invoices: d.invoices.filter((i) => i.id !== invoice.id), recentInvoices: (d.recentInvoices || []).filter((i) => i.id !== invoice.id), pagination: { ...d.pagination, total: Math.max(0, d.pagination.total - 1) } }
          : d,
      )
      toast.undoable(`Deleted ${invoice.invoiceNumber}`, {
        undo: restore,
        commit: () =>
          del.mutate(invoice.id, {
            onError: (e) => {
              restore()
              toast.error('Could not delete the invoice', normalizeError(e).message)
            },
          }),
      })
    },
    [qc, toast, del],
  )
}
