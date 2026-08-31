const CACHE_NAME = 'caudete-fiestas-v1';

// Añadimos los archivos mínimos que tu app necesita para arrancar
const assets = [
  '/',
  '/index.html',
  '/manifest.json',
  '/img/logo-ctv.png'
];

// 1. Evento de instalación: Guarda los archivos esenciales en la memoria del móvil
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assets);
    }).then(() => self.skipWaiting()) // Fuerza a la app a actualizarse rápido
  );
});

// 2. Evento de activación: Limpia cachés antiguas si haces cambios en el futuro
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

// 3. Evento Fetch (OBLIGATORIO): Intercepta las peticiones para que sea instalable
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // Si el archivo está en caché lo usa, si no, lo busca en internet
      return cachedResponse || fetch(e.request);
    })
  );
});
