const CACHE_NAME = 'caudete-fiestas-test-youtube-v1';
const CACHE_PREFIX = 'caudete-fiestas-test-youtube-';
const ASSETS = [
  './testyoutube.html',
  './manifest-testyoutube.json',
  './img/logo-ctv.png',
  './img/escudo-ayuntamiento.png',
  './img/logo-mayordomia.png',
  './img/Cartel-Fiestas-espera.png',
  './img/logo-asociacion.png',
  './img/guerreros.png',
  './img/mirenos.png',
  './img/tarik.png',
  './img/moros.png',
  './img/antigua.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (
    event.request.method !== 'GET' ||
    requestUrl.origin !== self.location.origin ||
    requestUrl.pathname.endsWith('.m3u8')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok) {
          return caches.open(CACHE_NAME).then((cache) => {
            return cache.put(event.request, networkResponse.clone())
              .then(() => networkResponse);
          });
        }

        return networkResponse;
      });
    })
  );
});
