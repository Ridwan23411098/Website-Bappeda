// SIP-KOMPETENSI — Bappeda Provinsi Lampung
// Service Worker for PWA & Background Push Notifications

const CACHE_NAME = 'sip-bappeda-v2026-10-v6';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// Cache & Offline Resilience
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Jangan cache request ke Supabase API secara statis
  if (url.hostname.includes('supabase.co')) return;

  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.status === 200) {
            const respClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, respClone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});

// Listener untuk Push Notification dari server
self.addEventListener('push', event => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch(e) {
      data = { title: 'SIP-KOMPETENSI Bappeda', body: event.data.text() };
    }
  }

  const title = data.title || 'SIP-KOMPETENSI — Bappeda Lampung';
  const options = {
    body: data.body || 'Pengajuan IDP baru telah diterima untuk diverifikasi.',
    icon: 'assets/logo-idp.png?v=2',
    badge: 'assets/logo-idp.png?v=2',
    vibrate: [200, 100, 200],
    data: data.url || '/',
    tag: 'sip-bappeda-idp',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Listener saat notifikasi diklik oleh user
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = event.notification.data || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
