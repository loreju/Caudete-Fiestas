const CACHE_NAME = 'caudete-fiestas-v7';

// Solo guardamos la estructura de la web, NADA de vídeos
const assets = [
  './',
  './index.html',
  './index.html?v=2',
  './manifest.json',
  './img/Cartel Fiestas-boton.png'
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

// Estrategia: Carga la web instantánea desde el móvil y el vídeo directo desde internet
self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // CORRECCIÓN SINCRONIZADA: Si busca tu señal de DuckDNS (.m3u8 o .ts), va directo a internet sin pasar por la caché
  if (url.includes('.m3u8') || url.includes('.ts') || url.includes('caudetefiestas.duckdns.org')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Para el index.html y assets estáticos, servirlo desde la caché del móvil al instante
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
