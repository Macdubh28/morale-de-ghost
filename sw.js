const CACHE_NAME = 'morale-de-ghost-v1.0.0';
const ASSETS_CACHE = [
  '/morale-de-ghost/style.css',
  '/morale-de-ghost/manifest.json'
];
const HTML_PAGES = [
  '/morale-de-ghost/',
  '/morale-de-ghost/index.html',
  '/morale-de-ghost/lois.html',
  '/morale-de-ghost/politique.html',
  '/morale-de-ghost/exercices.html',
  '/morale-de-ghost/logos.html'
];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll([...HTML_PAGES, ...ASSETS_CACHE]))
  );
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      });
    })
  );
});
