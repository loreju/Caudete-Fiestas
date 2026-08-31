// Forzamos la versión v3 para obligar al navegador a borrar la caché vieja ralentizada
const CACHE_NAME = 'caudete-fiestas-v3';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

// Evento fetch vacío: Carga todo directo de internet (velocidad máxima para el vídeo)
self.addEventListener('fetch', (e) => {
  // No hace nada. Deja pasar todo el tráfico nativo.
});
