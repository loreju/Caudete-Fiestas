const CACHE_NAME = 'caudete-fiestas-v9';

// Guardem només l'estructura de la web, evitant fitxers de vídeo infinits
const assets = [
  './',
  './index.html',
  './index.html?v=5',
  './manifest.json',
  './img/Cartel Fiestas-boton.jpeg'
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

// Intercepta les peticions: el vídeo va directe a internet, el disseny va per memòria cau
self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // Si l'usuari demana el streaming de DuckDNS, el deixem passar sense tocar la memòria cau
  if (url.includes('.m3u8') || url.includes('.ts') || url.includes('caudetefiestas.duckdns.org')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Per a la resta de fitxers de disseny, es serveixen a l'instant
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
