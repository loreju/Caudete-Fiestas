// Service Worker fantasma per activar el botó sense alentir el vídeo
const CACHE_NAME = 'caudete-fiestas-v99';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Buit. Deixa passar el streaming a màxima velocitat nativa.
});
