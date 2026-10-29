// Minimal service worker. It caches the static app shell only. API traffic and anything with credentials is NEVER cached.
const VERSION = 'ip-v2'
const SHELL = ['/offline.html', '/offline.css', '/favicon.svg', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return
  if (request.mode === 'navigate') {
    // Pages are always fetched fresh; when offline show the offline page.
    event.respondWith(fetch(request).catch(() => caches.match('/offline.html')))
    return
  }
  if (url.pathname.startsWith('/assets/')) {
    // Hashed build assets are immutable, so cache-first is safe.
    event.respondWith(
      caches.match(request).then((hit) => hit || fetch(request).then((res) => {
        // Clone synchronously: once `res` is returned to the page its body is consumed, and a clone made later throws
        // "Response body is already used".
        if (res.ok) {
          const copy = res.clone()
          caches.open(VERSION).then((cache) => cache.put(request, copy)).catch(() => {})
        }
        return res
      })),
    )
  }
})
