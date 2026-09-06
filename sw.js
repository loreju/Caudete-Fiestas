const CACHE_NAME = 'caudete-fiestas-v2';
// SOLO guardamos en el móvil el diseño y los logos para que cargue instantáneo
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './img/logo-ctv.png',
  './img/escudo-ayuntamiento.png',
  './img/logo-mayordomia.png',
  './img/Cartel-Fiestas-espera.png',
  './img/Cartel-Fiestas-boton.png',
  './img/logo-asociacion.png',
  './img/guerreros.png',
  './img/mirenos.png',
  './img/tarik.png',
  './img/moros.png',
  './img/antigua.png'
];

// Instalación de la memoria caché
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activación y limpieza de cachés viejas
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

// Estrategia de carga rápida: si está en el móvil lo enseña, si es el vídeo va directo a internet
self.addEventListener('fetch', (e) => {
  // EXCLUSIÓN CRÍTICA: Si es el vídeo de DuckDNS, NO se guarda en caché, va directo por red
  if (e.request.url.includes('duckdns.org') || e.request.url.includes('.m3u8')) {
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request);
    })
  );
});
