const CACHE_NAME = 'caudete-fiestas-v6';

// Solo guardamos la estructura de la web, NADA de vídeos
const assets = [
  './',
  './index.html',
  './index.html?v=2',
  './manifest.json',
  './img/Cartel Fiestas-botón.png'
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
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia: Carga la web instantánea desde el móvil y el vídeo desde internet
self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // CORRECCIÓN: Si busca streaming, va directo a internet sin pasar por la caché
  if (url.includes('.m3u8') || url.includes('.ts') || url.includes('duckdns.org')) {
    return e.respondWith(fetch(e.request));
  }

  // Para el index.html y assets, servirlo desde la caché del móvil al instante
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
