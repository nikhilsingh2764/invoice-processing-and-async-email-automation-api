import { describe, expect, it, vi } from 'vitest'
import { createClient, NO_REFRESH_PATHS } from '../src/api/client.js'

const json = (config, status, data, headers = {}) => ({ data, status, statusText: '', headers, config, request: {} })
const reject = (config, status, message) => {
  const error = new Error(`HTTP ${status}`)
  error.config = config
  error.isAxiosError = true
  error.response = json(config, status, { success: false, message })
  return Promise.reject(error)
}

/** Fake network: `routes` maps "METHOD /path" to a function (config, callIndex) => response | rejection. */
function fakeAdapter(routes) {
  const calls = []
  const adapter = (config) => {
    const key = `${String(config.method).toUpperCase()} ${config.url}`
    calls.push({ key, headers: config.headers })
    const n = calls.filter((c) => c.key === key).length
    const handler = routes[key]
    if (!handler) return Promise.reject(Object.assign(new Error(`unrouted ${key}`), { config }))
    return Promise.resolve(handler(config, n))
  }
  return { adapter, calls }
}

describe('axios client: single-flight refresh', () => {
  it('refreshes once on a token 401, then retries the original request', async () => {
    const { adapter, calls } = fakeAdapter({
      'GET /profile': (c, n) => (n === 1 ? reject(c, 401, 'Authentication token has expired') : json(c, 200, { data: { ok: true } })),
      'POST /refresh-token': (c) => json(c, 200, { data: null }),
    })
    const client = createClient({ baseURL: '/api/v1', adapter })
    const res = await client.get('/profile')
    expect(res.data.data.ok).toBe(true)
    expect(calls.map((c) => c.key)).toEqual(['GET /profile', 'POST /refresh-token', 'GET /profile'])
  })

  it('shares ONE refresh between concurrent 401s', async () => {
    let refreshes = 0
    const { adapter } = fakeAdapter({
      'GET /a': (c, n) => (n === 1 ? reject(c, 401, 'Invalid authentication token') : json(c, 200, { data: 'a' })),
      'GET /b': (c, n) => (n === 1 ? reject(c, 401, 'Authentication token has expired') : json(c, 200, { data: 'b' })),
      'GET /c': (c, n) => (n === 1 ? reject(c, 401, 'Authentication token is required') : json(c, 200, { data: 'c' })),
      'POST /refresh-token': (c) => {
        refreshes += 1
        return new Promise((r) => setTimeout(() => r(json(c, 200, {})), 20))
      },
    })
    const client = createClient({ baseURL: '/api/v1', adapter })
    const out = await Promise.all([client.get('/a'), client.get('/b'), client.get('/c')])
    expect(out.map((r) => r.data.data)).toEqual(['a', 'b', 'c'])
    expect(refreshes).toBe(1)
  })

  it.each(NO_REFRESH_PATHS)('never tries to refresh for %s', async (path) => {
    const { adapter, calls } = fakeAdapter({ [`POST ${path}`]: (c) => reject(c, 401, 'Authentication token has expired') })
    const client = createClient({ baseURL: '/api/v1', adapter })
    await expect(client.post(path)).rejects.toThrow()
    expect(calls).toHaveLength(1)
  })

  it('does not refresh for a wrong password (401 with another message)', async () => {
    const { adapter, calls } = fakeAdapter({ 'PATCH /change-password': (c) => reject(c, 401, 'Old password is incorrect') })
    const client = createClient({ baseURL: '/api/v1', adapter })
    await expect(client.patch('/change-password', {})).rejects.toThrow()
    expect(calls).toHaveLength(1)
  })

  it('signs out when the refresh itself fails, and does not loop', async () => {
    const onSessionExpired = vi.fn()
    const { adapter, calls } = fakeAdapter({
      'GET /profile': (c) => reject(c, 401, 'Authentication token has expired'),
      'POST /refresh-token': (c) => reject(c, 401, 'Invalid refresh token'),
    })
    const client = createClient({ baseURL: '/api/v1', adapter, handlers: { onSessionExpired } })
    await expect(client.get('/profile')).rejects.toThrow()
    expect(onSessionExpired).toHaveBeenCalledTimes(1)
    expect(calls.map((c) => c.key)).toEqual(['GET /profile', 'POST /refresh-token'])
  })

  it('retries at most once', async () => {
    const { adapter, calls } = fakeAdapter({
      'GET /x': (c) => reject(c, 401, 'Authentication token has expired'),
      'POST /refresh-token': (c) => json(c, 200, {}),
    })
    const client = createClient({ baseURL: '/api/v1', adapter })
    await expect(client.get('/x')).rejects.toThrow()
    expect(calls.filter((c) => c.key === 'GET /x')).toHaveLength(2)
    expect(calls.filter((c) => c.key === 'POST /refresh-token')).toHaveLength(1)
  })
})

describe('axios client: request hygiene', () => {
  it('adds X-Requested-With on writes only', async () => {
    const { adapter, calls } = fakeAdapter({ 'GET /g': (c) => json(c, 200, {}), 'POST /p': (c) => json(c, 200, {}) })
    const client = createClient({ baseURL: '/api/v1', adapter, csrf: true })
    await client.get('/g')
    await client.post('/p', {})
    expect(calls[0].headers.get('X-Requested-With')).toBeFalsy()
    expect(calls[1].headers.get('X-Requested-With')).toBe('InvoicePilot')
  })
  it('pins Accept-Language to English so message matching works for every browser locale', () => {
    const client = createClient({ baseURL: '/api/v1', adapter: () => Promise.resolve({}) })
    expect(client.defaults.headers['Accept-Language']).toBe('en')
  })
  it('refuses absolute URLs so a data-driven path cannot leave the API origin', async () => {
    const { adapter } = fakeAdapter({})
    const client = createClient({ baseURL: '/api/v1', adapter })
    expect(client.defaults.allowAbsoluteUrls).toBe(false)
    expect(client.defaults.withCredentials).toBe(true)
  })
})
