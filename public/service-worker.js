const CACHE_NAME = 'vettix-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/img/icon-pwa-192.png',
  '/img/icon-pwa-512.png',
  '/img/icon.png',
  '/img/icon2.png',
  '/img/logo.png',
  '/img/home.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Error al cachear recursos:', error);
      })
  );
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Forzar que todos los clientes usen el nuevo service worker
      return self.clients.claim();
    })
  );
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // No cachear el manifest.json, siempre obtener la versión más reciente
  if (url.pathname === '/manifest.json') {
    event.respondWith(fetch(event.request));
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - devolver respuesta del cache
        if (response) {
          return response;
        }

        // Clonar la petición
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Verificar si la respuesta es válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clonar la respuesta
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        }).catch(() => {
          // Si falla la red, intentar devolver una página offline
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

