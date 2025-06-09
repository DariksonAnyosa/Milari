// Service Worker para MILARI IA
// Enables offline functionality and auto-updates

const CACHE_NAME = 'milari-ia-v' + new Date().getTime(); // Dynamic versioning
const API_CACHE_NAME = 'milari-api-v1';

// Files to cache for offline use
const STATIC_CACHE_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static assets and skip waiting for immediate activation
self.addEventListener('install', (event) => {
  console.log('🚀 MILARI IA Service Worker: Installing new version...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 MILARI IA: Caching static files');
        return cache.addAll(STATIC_CACHE_FILES);
      })
      .then(() => {
        console.log('✅ MILARI IA: New version cached');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', (event) => {
  console.log('🔄 MILARI IA Service Worker: Activating new version...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('🗑️ MILARI IA: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ MILARI IA: New version activated');
        // Take control of all clients immediately
        return self.clients.claim();
      })
      .then(() => {
        // Notify all clients about the update
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_UPDATED',
              message: '🎉 MILARI IA se ha actualizado automáticamente'
            });
          });
        });
      })
  );
});

// Listen for skip waiting message from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch event - handle requests with cache-first strategy for static files
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle static assets with stale-while-revalidate strategy
  event.respondWith(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.match(request)
          .then(cachedResponse => {
            // Fetch from network in background to update cache
            const fetchPromise = fetch(request)
              .then(networkResponse => {
                if (networkResponse.ok) {
                  cache.put(request, networkResponse.clone());
                }
                return networkResponse;
              })
              .catch(() => {
                console.log('🌐 MILARI IA: Network request failed for:', request.url);
              });

            // Return cached version immediately, or wait for network
            return cachedResponse || fetchPromise;
          });
      })
      .catch(() => {
        // If cache fails, try network
        return fetch(request);
      })
  );
});

console.log('🧠 MILARI IA Service Worker loaded - Auto-update enabled');