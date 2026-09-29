const CACHE_NAME = 'caudete-fiestas-v19'; // Subimos a v19 para obligar a los móviles a actualizar el manifest e icono

// Guardamos solo lo imprescindible para asegurar una instalación limpia sin fallos de ruta
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Instalación de la memoria caché
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usamos un método tolerante: si una imagen falla, el SW se instala igual
      cache.addAll(ASSETS).catch(err => console.log("Aviso en caché estática:", err));
      return cache;
    }).then(() => self.skipWaiting())
  );
});

// Activación y limpieza estricta de cachés viejas (v1, v2, v3, v4...)
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

// Estrategia de carga rápida con exclusión total de streaming
self.addEventListener('fetch', (e) => {
  // EXCLUSIÓN CRÍTICA DE STREAMING: Bunny CDN, reproductores e hilos m3u8 directos a red
  if (
    e.request.url.includes('mediadelivery.net') || 
    e.request.url.includes('bunny.net') || 
    e.request.url.includes('duckdns.org') || 
    e.request.url.includes('.m3u8')
  ) {
    e.respondWith(fetch(e.request));
    return;
  }
  
  // Cache dinámico: lo que use el usuario se guarda automáticamente si no es vídeo
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        // Solo guardamos peticiones válidas de nuestra propia web
        if (networkResponse && networkResponse.status === 200 && e.request.url.startsWith(self.location.origin)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback silencioso si no hay internet
      });
    })
  );
});
