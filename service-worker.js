const CACHE_NAME = 'strideclash-v1';
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json'
];

// Install Event: Caches the static layout infrastructure
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: Cleans up obsolete cache versions
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
  self.clients.claim();
});

// Fetch Event: Core offline handling strategy
self.addEventListener('fetch', (event) => {
  // Pass through the live API database calls straight to network bypass
  if (event.request.url.includes('script.google.com')) {
    return fetch(event.request);
  }

  // Cache-first strategy for index and manifest UI layers
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
