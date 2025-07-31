// SERVICE WORKER CHRONOTIME v2.0
// Cache intelligent et synchronisation offline

const CACHE_NAME = 'chronotime-v2.1.0';
const STATIC_CACHE = 'chronotime-static-v2.1.0';
const DYNAMIC_CACHE = 'chronotime-dynamic-v2.1.0';

const STATIC_FILES = [
  '/',
  '/index.html',
  '/index-debug.html',

  '/initial-d-style.css',
  '/responsive.css',
  '/accessibility-improvements.css',
  '/advanced-animations.css',
  '/api.js',
  '/app.js',
  '/map.js',
  '/legal-disclaimer.js',
  '/legal-footer.js',
  '/mobile-navigation.js',
  '/ux-improvements.js',
  '/performance-optimizations.js',
  '/accessibility-enhancements.js',
  '/theme-system.js',
  '/pwa-system.js'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installation en cours...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Mise en cache des fichiers statiques');
        // Filtrer les fichiers existants avant la mise en cache
        const validFiles = [];
        const checkPromises = STATIC_FILES.map(url => 
          fetch(url).then(response => {
            if (response.ok) {
              validFiles.push(url);
            } else {
              console.warn(`⚠️ Fichier non trouvé, ignoré: ${url}`);
            }
          }).catch(error => {
            console.warn(`⚠️ Fichier ignoré: ${url}`, error.message);
          })
        );
        
        return Promise.all(checkPromises).then(() => {
          console.log(`📊 Fichiers valides à mettre en cache: ${validFiles.length}/${STATIC_FILES.length}`);
          return cache.addAll(validFiles);
        });
      })
      .then(() => {
        console.log('✅ Service Worker installé avec succès');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Erreur installation Service Worker:', error);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activation en cours...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activé avec succès');
        return self.clients.claim();
      })
      .catch(error => {
        console.error('❌ Erreur activation Service Worker:', error);
      })
  );
});

// Gestion des requêtes (Fetch)
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Stratégie pour les requêtes API - Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(request, responseClone))
              .catch(error => console.warn('Cache API error:', error));
          }
          return response;
        })
        .catch(() => {
          // Fallback vers le cache si réseau indisponible
          return caches.match(request)
            .then(response => {
              if (response) {
                return response;
              }
              // Réponse par défaut pour les API
              return new Response(JSON.stringify({
                error: 'Mode hors ligne',
                message: 'Cette fonctionnalité nécessite une connexion internet'
              }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
    return;
  }
  
  // Stratégie pour les fichiers statiques - Cache First
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response;
        }
        
        // Si pas en cache, récupérer du réseau
        return fetch(request)
          .then(response => {
            // Vérifier que la réponse est valide
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Mettre en cache pour les futures requêtes
            if (request.method === 'GET') {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE)
                .then(cache => cache.put(request, responseClone))
                .catch(error => console.warn('Cache dynamique error:', error));
            }
            
            return response;
          })
          .catch(error => {
            console.warn('Fetch error:', error);
            
            // Fallback pour les pages de navigation
            if (request.mode === 'navigate') {
              return caches.match('/index.html')
                .then(response => {
                  if (response) {
                    return response;
                  }
                  // Page d'erreur de base
                  return new Response(`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <title>ChronoTime - Hors ligne</title>
                        <style>
                          body { 
                            font-family: Arial, sans-serif; 
                            background: #000; 
                            color: #fff; 
                            text-align: center; 
                            padding: 50px; 
                          }
                          .offline { color: #ff6600; }
                        </style>
                      </head>
                      <body>
                        <h1>🏁 ChronoTime</h1>
                        <h2 class="offline">📴 Mode hors ligne</h2>
                        <p>Vérifiez votre connexion internet et réessayez.</p>
                      </body>
                    </html>
                  `, {
                    headers: { 'Content-Type': 'text/html' }
                  });
                });
            }
            
            throw error;
          });
      })
  );
});

// Synchronisation en arrière-plan
self.addEventListener('sync', event => {
  console.log('🔄 Background Sync:', event.tag);
  
  if (event.tag === 'background-sync-chronos') {
    event.waitUntil(syncChronos());
  }
});

// Notifications Push
self.addEventListener('push', event => {
  console.log('🔔 Push notification reçue');
  
  const options = {
    body: event.data ? event.data.text() : 'Nouveau message ChronoTime',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Voir',
        icon: '/icon-explore.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/icon-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('ChronoTime', options)
  );
});

// Clic sur notification
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification cliquée:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Fonction de synchronisation des chronos
async function syncChronos() {
  try {
    console.log('🔄 Synchronisation des chronos...');
    
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    const pendingRequests = requests.filter(req => 
      req.url.includes('/api/chronos') && req.method === 'POST'
    );
    
    for (const request of pendingRequests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
          console.log('✅ Chrono synchronisé');
        }
      } catch (error) {
        console.error('❌ Erreur sync chrono:', error);
      }
    }
    
    console.log('✅ Synchronisation terminée');
  } catch (error) {
    console.error('❌ Erreur background sync:', error);
  }
}

// Gestion des erreurs globales
self.addEventListener('error', event => {
  console.error('❌ Erreur Service Worker:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('❌ Promise rejetée dans Service Worker:', event.reason);
  event.preventDefault();
});

console.log('🏁 Service Worker ChronoTime v2.0 chargé avec succès');
