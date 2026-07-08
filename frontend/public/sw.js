const CACHE_NAME = 'lpu-hrdc-nexus-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Interceptor for Offline Cache fallback
self.addEventListener('fetch', (event) => {
  const req = event.request;
  
  // Apply Network-First for API requests, Cache-First for static assets
  if (req.url.includes('/api/v1/')) {
    event.respondWith(
      fetch(req)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(req).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // Return JSON indicating client is offline
            return new Response(
              JSON.stringify({ error: "Offline mode active. No cached response available." }),
              { headers: { "Content-Type": "application/json" }, status: 503 }
            );
          });
        })
    );
  } else {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        return cachedResponse || fetch(req).catch(() => {
          // If navigation, return index.html shell
          if (req.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
    );
  }
});
