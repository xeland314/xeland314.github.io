// v2: purga cachés con respuestas redirigidas (/ruta -> /ruta/) guardadas por v1
const CACHE_NAME = 'xeland-portfolio-v2';

// Recursos mínimos para que la app cargue offline
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/assets/images/icon-192x192.png',
  '/assets/images/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignorar peticiones que no sean GET (como POSTs) o esquemas que no sean http/https
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;
  // Solo mismo origen: lo externo (CDN, APIs) va directo a la red
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Guardar en caché dinámicamente lo que el usuario va visitando
        try {
          // No guardar respuestas redirigidas: GitHub Pages responde /ruta -> 301 -> /ruta/
          // y una navegación no acepta una respuesta con redirected=true (ERR_FAILED)
          if (networkResponse && networkResponse.ok && !networkResponse.redirected) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(event.request, clone))
              .catch(() => {});
          }
        } catch (err) {
          // Ignorar fallos al clonar/cachear (por ejemplo, cuerpos ya consumidos)
        }
        return networkResponse;
      }).catch(() => {
        // Si no hay internet y no está en caché
        return cachedResponse;
      });

      // Retorna la caché instantáneamente, o hace la petición a red
      // Por si quedó alguna redirigida en caché: ir a la red
      if (cachedResponse && cachedResponse.redirected) return fetchPromise;
      return cachedResponse || fetchPromise;
    })
  );
});
