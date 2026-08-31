const CACHE_NAME = 'caudete-fiestas-v2'; // Cambiado a v2 para forzar la actualización

const assets = [
  '/',
  '/index.html',
  '/manifest.json',
  '/img/logo-ctv.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assets);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// EVENTO FETCH CORREGIDO: Evita que el streaming pase por la caché
self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // REGLA DE EXCLUSIÓN: Si la petición busca el vídeo (.m3u8, .ts o duckdns), va directo a internet
  if (url.includes('.m3u8') || url.includes('.ts') || url.includes('duckdns.org')) {
    return fetch(e.request); 
  }

  // Para el resto de archivos estáticos (html, imágenes), usa la estrategia normal
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
