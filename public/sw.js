// ═══════════════════════════════════════════════════════════
// VENUEZA — Production Service Worker
// Version-managed, cache-first for static, network-only for API
// ═══════════════════════════════════════════════════════════

const APP_VERSION = '1.0.0';
const CACHE_NAME = `venueza-v${APP_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Static assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/icons/apple-touch-icon.svg',
];

// Patterns that should NEVER be cached (security-sensitive)
const NEVER_CACHE_PATTERNS = [
  /\/api\//,           // All API requests
  /\/auth\//,          // Authentication
  /hm_token/,         // JWT tokens
  /localhost:\d+\/api/, // Dev API
];

// Patterns for cacheable static assets
const CACHEABLE_PATTERNS = [
  /\.js$/,
  /\.css$/,
  /\.svg$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.webp$/,
  /\.woff2?$/,
  /\.ttf$/,
  /\.ico$/,
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
];

// ── INSTALL ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing Venueza v${APP_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ─────────────────────────────────────────────
// Clean up old caches from previous versions
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating Venueza v${APP_VERSION}`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('venueza-') && name !== CACHE_NAME)
          .map((name) => {
            console.log(`[SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ── FETCH ────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) protocols
  if (!url.protocol.startsWith('http')) return;

  // ── NEVER cache API/auth requests ──
  if (NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(request.url))) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return a proper JSON error for API requests when offline
        if (/\/api\//.test(request.url)) {
          return new Response(
            JSON.stringify({ error: 'You are offline. Please check your connection.' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // ── Navigation requests → Network first, fallback to cache/offline ──
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the navigated page for offline shell
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL));
        })
    );
    return;
  }

  // ── Google Fonts → Stale While Revalidate ──
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // ── Static assets → Cache First ──
  if (CACHEABLE_PATTERNS.some((pattern) => pattern.test(request.url))) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        }).catch(() => {
          // For images, return a placeholder or just fail silently
          if (/\.(png|jpg|jpeg|webp|svg)$/.test(request.url)) {
            return new Response('', { status: 404 });
          }
          return new Response('', { status: 503 });
        });
      })
    );
    return;
  }

  // ── Everything else → Network with cache fallback ──
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// ── MESSAGE HANDLER ──────────────────────────────────────
// Handle messages from the main app (skip waiting, clear cache, etc.)
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data === 'CLEAR_CACHES') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }

  if (event.data === 'GET_VERSION') {
    event.source.postMessage({ type: 'VERSION', version: APP_VERSION });
  }
});

// ── PUSH NOTIFICATION (Architecture Ready) ───────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'New notification from Venueza',
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-96x96.svg',
      vibrate: [100, 50, 100],
      data: { url: data.url || '/' },
      actions: data.actions || [],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Venueza', options)
    );
  } catch (e) {
    console.error('[SW] Push parse error:', e);
  }
});

// ── NOTIFICATION CLICK ───────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Focus existing window or open new one
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

// ── BACKGROUND SYNC (Architecture Ready) ─────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bookings') {
    console.log('[SW] Background sync: bookings');
    // Future: Replay queued booking requests
  }
  if (event.tag === 'sync-payments') {
    console.log('[SW] Background sync: payments');
    // Future: Replay queued payment updates
  }
});
