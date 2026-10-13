const CACHE_NAME = 'Caudete-Fiestas-v60'; // Subimos a v60 para forzar la actualización en todos los móviles
const CACHE_PREFIX = 'Caudete-Fiestas-';

// Todos tus archivos estáticos reales y definitivos en GitHub Pages
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './img/cartel-fiestas-192.png', // Icono oficial del manifest asignado
  './img/cartel-fiestas-592.png', // Icono oficial del manifest asignado
  './img/escudo-ayuntamiento.png',
  './img/logo-mayordomia.png',
  './img/logo-asociacion.png',
  './img/guerreros.png',
  './img/mirenos.png',
  './img/tarik.png',
  './img/moros.png',
  './img/antigua.png'
];

// Instalación tolerante: si una imagen falta o cambia en GitHub, la PWA se instala igual
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS).catch(err => console.warn("Aviso en precaché estática:", err));
      })
      .then(() => self.skipWaiting())
  );
});

// Limpieza automática y estricta de cualquier caché antigua o de pruebas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME) // Elimina almacenes antiguos automáticamente
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Interceptación de peticiones y estrategia de carga eficiente
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 1. EXCLUSIÓN ABSOLUTA DE YOUTUBE Y GOOGLE: Carga directa desde internet siempre
  // Al usar un reproductor de YouTube incrustado, la PWA no debe interferir con sus conexiones de vídeo
  if (
    requestUrl.hostname.includes('youtube.com') || 
    requestUrl.hostname.includes('youtu.be') || 
    requestUrl.hostname.includes('ggpht.com') || // Miniaturas de YouTube
    requestUrl.hostname.includes('google')
  ) {
    return; // Pasa de largo, va directo a la red sin tocar la caché
  }

  // Manejamos únicamente peticiones GET de la web de las fiestas en GitHub Pages
  if (event.request.method !== 'GET' || requestUrl.origin !== self.location.origin) {
    return;
  }

  // 2. Sistema de caché dinámica para los componentes de tu repositorio
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      }).catch(() => {
        // Respuesta vacía controlada si falla internet por completo
      });
    })
  );
});
