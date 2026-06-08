// Service Worker básico para Portal Pronóstico Q2
// Hace la app instalable y guarda el index.html en caché para arranque offline
const CACHE = 'pronostico-q2-v9';
const ASSETS = [
  './',
  './index.html',
  './voces.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Estrategia: red primero, caché como respaldo (para que vea datos frescos cuando hay red)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        // Guarda copia para offline
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy).catch(() => {}));
        return resp;
      })
      .catch(() => caches.match(e.request).then((c) => c || caches.match('./index.html')))
  );
});
