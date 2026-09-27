const CACHE_NAME = 'al-kareem-shell-v2'
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(['/', '/manifest.json', '/icon-192.png', '/icon-512.png']),
    ),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
    )),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/') || url.pathname.startsWith('/videos/')) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put('/', copy)))
          return response
        })
        .catch(() => caches.match('/')),
    )
    return
  }

  event.respondWith(
    fetch(request).then((response) => {
      // Only full 200 responses can be cached (audio range requests return 206).
      if (response.status === 200) {
        const copy = response.clone()
        event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)))
      }
      return response
    }).catch(() => caches.match(request)),
  )
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload = {}
  try {
    payload = event.data.json()
  } catch {
    payload = { body: event.data.text() }
  }

  const title = payload.title ?? 'Al-Kareem'
  const options = {
    body: payload.body ?? '',
    icon: payload.icon ?? '/icon-192.png',
    tag: payload.tag ?? 'alkarim-streak-reminder',
    badge: '/icon-192.png',
    renotify: false,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow('/')
    }),
  )
})
