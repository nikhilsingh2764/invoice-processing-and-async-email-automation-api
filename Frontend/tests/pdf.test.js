import { beforeEach, describe, expect, it, vi } from 'vitest'

const responses = []
const get = vi.fn(async (url) => {
  const next = responses.shift()
  if (!next) throw new Error(`unexpected GET ${url}`)
  return next
})
vi.mock('../src/api/client.js', () => ({ http: { get: (...a) => get(...a) } }))

const { fetchInvoicePdf, PdfInvalidError, PdfTimeoutError, pdfReducer, initialPdfState } = await import('../src/api/pdf.js')
const pdf = () => new TextEncoder().encode('%PDF-1.4 test').buffer
const ok = (data = pdf(), type = 'application/pdf') => ({ status: 200, data, headers: { 'content-type': type } })
const queued = (jobId = 'j1') => ({ status: 202, data: { jobId }, headers: {} })
const status = (s) => ({ status: 200, data: { status: s }, headers: {} })
const noSleep = () => Promise.resolve()

describe('fetchInvoicePdf', () => {
  beforeEach(() => {
    responses.length = 0
    get.mock?.calls && (get.mock.calls.length = 0)
  })
  it('returns bytes straight away on 200', async () => {
    responses.push(ok())
    const bytes = await fetchInvoicePdf('i1', { sleep: noSleep })
    expect(bytes.byteLength).toBeGreaterThan(5)
  })
  it('on 202 polls the job status, then fetches the PDF once', async () => {
    responses.push(queued(), status('active'), status('completed'), ok())
    const attempts = []
    await fetchInvoicePdf('i1', { sleep: noSleep, onAttempt: (n) => attempts.push(n) })
    expect(attempts).toEqual([1, 2])
    expect(get.mock.calls.map((c) => c[0])).toEqual(['/invoice/i1/pdf', '/invoice/pdf/status/j1', '/invoice/pdf/status/j1', '/invoice/i1/pdf'])
  })
  it('falls back to polling the PDF URL when no jobId is given', async () => {
    responses.push({ status: 202, data: {}, headers: {} }, queued(''), ok())
    const bytes = await fetchInvoicePdf('i1', { sleep: noSleep })
    expect(bytes.byteLength).toBeGreaterThan(5)
  })
  it('times out after the maximum number of attempts', async () => {
    responses.push(queued())
    for (let i = 0; i < 3; i += 1) responses.push(status('active'))
    await expect(fetchInvoicePdf('i1', { sleep: noSleep, maxAttempts: 3 })).rejects.toThrow(PdfTimeoutError)
  })
  it('rejects a response that is not a PDF', async () => {
    responses.push(ok(new TextEncoder().encode('<html>').buffer, 'text/html'))
    await expect(fetchInvoicePdf('i1', { sleep: noSleep })).rejects.toThrow(PdfInvalidError)
  })
  it('rejects a PDF content type with the wrong bytes', async () => {
    responses.push(ok(new TextEncoder().encode('not a pdf at all').buffer))
    await expect(fetchInvoicePdf('i1', { sleep: noSleep })).rejects.toThrow(PdfInvalidError)
  })
  it('stops when the job failed', async () => {
    responses.push(queued(), status('failed'))
    await expect(fetchInvoicePdf('i1', { sleep: noSleep })).rejects.toThrow(PdfInvalidError)
  })
})

describe('pdfReducer', () => {
  it('walks idle -> requesting -> polling -> success', () => {
    let s = pdfReducer(initialPdfState, { type: 'start' })
    expect(s.phase).toBe('requesting')
    s = pdfReducer(s, { type: 'poll', attempt: 3 })
    expect(s).toMatchObject({ phase: 'polling', attempt: 3 })
    expect(pdfReducer(s, { type: 'success' }).phase).toBe('success')
  })
  it('ignores poll ticks after the flow ended', () => expect(pdfReducer(pdfReducer(initialPdfState, { type: 'timeout' }), { type: 'poll', attempt: 1 }).phase).toBe('timeout'))
})
