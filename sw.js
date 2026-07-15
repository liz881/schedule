const CACHE = 'study-tracker-v1';
const ASSETS = [
  '/schedule/',
  '/schedule/study-tracker.html',
  '/schedule/manifest.json',
  '/schedule/icon.svg',
  'https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js'
];

// Install — cache all assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Fetch — cache-first for assets, network-first for page
self.addEventListener('fetch', e => {
  // Skip non-GET and chrome-extension requests
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      // Return cached immediately, then update cache in background
      const fetchPromise = fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => cached); // Offline fallback
      return cached || fetchPromise;
    })
  );
});
