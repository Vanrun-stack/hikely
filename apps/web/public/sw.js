const CACHE_NAME = 'hikely-cache-v1';

// Fichiers statiques vitaux à cacher pour le mode hors-ligne
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Stratégie pour les tuiles de cartes (Cache First, Network Fallback)
  if (
    url.hostname.includes('tile.openstreetmap.org') ||
    url.hostname.includes('server.arcgisonline.com') ||
    url.hostname.includes('elevation-tiles-prod')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          return caches.open('hikely-map-tiles').then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Stratégie pour les API (Network First, Cache Fallback)
  if (url.pathname.startsWith('/api/') || event.request.method === 'POST') {
    return; // Laissez le navigateur gérer (ou ajoutez Background Sync plus tard)
  }

  // Stratégie par défaut (Network First, Cache Fallback)
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Optionnel : Mettre en cache la nouvelle page html
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('/offline');
          }
          return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
      })
  );
});
