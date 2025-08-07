// SERVICE WORKER CHRONOTIME v3.0 - MODE HORS-LIGNE AVANCÉ
// Cache intelligent, synchronisation offline et fonctionnalités complètes

const CACHE_NAME = 'chronotime-v3.1.0';
const STATIC_CACHE = 'chronotime-static-v3.1.0';
const DYNAMIC_CACHE = 'chronotime-dynamic-v3.1.0';
const API_CACHE = 'chronotime-api-v3.1.0';
const OFFLINE_CACHE = 'chronotime-offline-v3.1.0';

const STATIC_FILES = [
  '/',
  '/index.html',
  
  // CSS Files (seulement ceux qui existent)
  '/initial-d-style.css',
  '/mobile-redesign.css',
  '/admin-style.css',
  '/ux-polish.css',
  '/mobile-fixes.css',
  '/map-isolation.css',
  '/map-isolation-enhanced.css',
  '/footer-fix.css',
  
  // JavaScript Files (seulement ceux qui existent)
  '/api.js',
  '/app.js',
  '/map.js',
  '/logo.js',
  '/admin-functions.js',
  '/admin-check.js',
  '/smooth-interactions.js',
  '/mobile-logout.js',
  '/simple-map-fix.js',
  '/mobile-interactions.js',
  '/mobile-navigation.js',
  
  // PWA Files
  '/manifest.json',
  
  // External Libraries (cached locally)
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/react@17/umd/react.production.min.js',
  'https://unpkg.com/react-dom@17/umd/react-dom.production.min.js',
  'https://unpkg.com/babel-standalone@6/babel.min.js',
  'https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&display=swap'
];

// Données à mettre en cache pour le mode hors-ligne
const OFFLINE_DATA = {
  courses: 'offline-courses',
  chronos: 'offline-chronos', 
  user: 'offline-user',
  settings: 'offline-settings'
};

// URLs API à mettre en cache
const API_URLS = [
  '/api/courses',
  '/api/chronos',
  '/api/users/profile'
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

// Gestion des requêtes (Fetch) - MODE HORS-LIGNE AVANCÉ
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // EXCLUSION des requêtes d'authentification - NE PAS INTERCEPTER
  if (url.pathname.startsWith('/api/auth/')) {
    // Laisser passer les requêtes d'auth directement sans interception
    return;
  }
  
  // Stratégie pour les requêtes API - Network First avec cache intelligent
  // SEULEMENT pour les requêtes GET
  if (url.pathname.startsWith('/api/') && request.method === 'GET') {
    event.respondWith(handleApiRequest(request, url));
    return;
  }
  
  // Stratégie pour les ressources externes (CDN)
  if (url.origin !== location.origin) {
    event.respondWith(handleExternalRequest(request));
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
            // Ne pas logger les erreurs pour les fichiers optionnels
            if (!request.url.includes('admin-style.css') && 
                !request.url.includes('accessibility-') && 
                !request.url.includes('advanced-animations') && 
                !request.url.includes('pwa-install.js') && 
                !request.url.includes('performance-optimizations') && 
                !request.url.includes('pwa-system-clean') && 
                !request.url.includes('icons/')) {
              console.warn('Fetch error:', error);
            }
            
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

// ===== FONCTIONS AVANCÉES POUR MODE HORS-LIGNE =====

// Gestion intelligente des requêtes API - SEULEMENT GET
async function handleApiRequest(request, url) {
  // Sécurité: Vérifier que c'est bien une requête GET
  if (request.method !== 'GET') {
    console.warn('⚠️ SW: Tentative d\'interception d\'une requête non-GET:', request.method, url.pathname);
    return fetch(request); // Laisser passer directement
  }
  
  const cacheKey = `api-${url.pathname}`;
  
  try {
    // Tentative réseau d'abord
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Mettre en cache SEULEMENT les réponses GET réussies
      const cache = await caches.open(API_CACHE);
      const responseClone = networkResponse.clone();
      
      // Ajouter timestamp pour expiration
      const responseWithTimestamp = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: {
          ...Object.fromEntries(responseClone.headers.entries()),
          'sw-cached-at': Date.now().toString(),
          'sw-cache-key': cacheKey
        }
      });
      
      // Mise en cache sécurisée
      try {
        await cache.put(request, responseWithTimestamp);
      } catch (cacheError) {
        console.warn('⚠️ Erreur mise en cache API:', cacheError);
      }
      
      // Sauvegarder les données importantes localement
      if (url.pathname === '/api/courses') {
        const data = await networkResponse.clone().json();
        await saveOfflineData(OFFLINE_DATA.courses, data);
      } else if (url.pathname === '/api/chronos') {
        const data = await networkResponse.clone().json();
        await saveOfflineData(OFFLINE_DATA.chronos, data);
      }
      
      return networkResponse;
    }
  } catch (error) {
    console.log('🚫 Réseau indisponible, utilisation du cache pour:', url.pathname);
  }
  
  // Fallback vers le cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Vérifier l'expiration (24h)
    const cachedAt = cachedResponse.headers.get('sw-cached-at');
    const isExpired = cachedAt && (Date.now() - parseInt(cachedAt)) > 24 * 60 * 60 * 1000;
    
    if (!isExpired) {
      // Ajouter un header pour indiquer que c'est du cache
      const response = new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: {
          ...Object.fromEntries(cachedResponse.headers.entries()),
          'sw-from-cache': 'true'
        }
      });
      return response;
    }
  }
  
  // Fallback vers les données hors-ligne sauvegardées
  if (url.pathname === '/api/courses') {
    const offlineData = await getOfflineData(OFFLINE_DATA.courses);
    if (offlineData) {
      return createOfflineResponse(offlineData);
    }
  } else if (url.pathname === '/api/chronos') {
    const offlineData = await getOfflineData(OFFLINE_DATA.chronos);
    if (offlineData) {
      return createOfflineResponse(offlineData);
    }
  }
  
  // Réponse par défaut avec données minimales
  return createOfflineErrorResponse(url.pathname);
}

// Gestion des ressources externes (CDN, fonts, etc.)
async function handleExternalRequest(request) {
  try {
    // Cache first pour les ressources externes (SEULEMENT GET)
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Si pas en cache, télécharger et mettre en cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok && request.method === 'GET') {
      try {
        const cache = await caches.open(STATIC_CACHE);
        await cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.warn('⚠️ Erreur cache externe:', cacheError);
      }
    }
    return networkResponse;
    
  } catch (error) {
    console.warn('🚫 Ressource externe indisponible:', request.url);
    
    // Fallback pour les polices
    if (request.url.includes('fonts.googleapis.com')) {
      return new Response('/* Fallback: police par défaut */', {
        headers: { 'Content-Type': 'text/css' }
      });
    }
    
    // Fallback générique
    return new Response('', { status: 503 });
  }
}

// Sauvegarde des données pour le mode hors-ligne
async function saveOfflineData(key, data) {
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    const response = new Response(JSON.stringify({
      data: data,
      timestamp: Date.now(),
      version: '3.0.0'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put(new Request(key), response);
    console.log('💾 Données sauvegardées hors-ligne:', key);
  } catch (error) {
    console.error('❌ Erreur sauvegarde hors-ligne:', error);
  }
}

// Récupération des données hors-ligne
async function getOfflineData(key) {
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    const response = await cache.match(new Request(key));
    if (response) {
      const offlineData = await response.json();
      // Vérifier que les données ne sont pas trop anciennes (7 jours)
      const isExpired = (Date.now() - offlineData.timestamp) > 7 * 24 * 60 * 60 * 1000;
      if (!isExpired) {
        return offlineData.data;
      }
    }
    return null;
  } catch (error) {
    console.error('❌ Erreur récupération hors-ligne:', error);
    return null;
  }
}

// Création d'une réponse hors-ligne avec données
function createOfflineResponse(data) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'sw-offline-mode': 'true',
      'sw-cache-status': 'offline-data'
    }
  });
}

// Création d'une réponse d'erreur hors-ligne avec données par défaut
function createOfflineErrorResponse(pathname) {
  let defaultData = [];
  let message = 'Mode hors-ligne actif';
  
  // Données par défaut selon l'endpoint
  if (pathname === '/api/courses') {
    defaultData = [
      {
        id: 'offline-course-1',
        nom: 'Course de démonstration (hors-ligne)',
        distance: 5000,
        denivele: 100,
        tracePath: []
      }
    ];
    message = 'Courses disponibles en mode hors-ligne limité';
  } else if (pathname === '/api/chronos') {
    defaultData = [];
    message = 'Chronos non disponibles hors-ligne - connexion requise';
  }
  
  return new Response(JSON.stringify({
    data: defaultData,
    offline: true,
    message: message,
    timestamp: Date.now()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'sw-offline-mode': 'true',
      'sw-cache-status': 'default-data'
    }
  });
}

// Nettoyage périodique des caches expirés
async function cleanExpiredCaches() {
  try {
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      if (cacheName.includes('chronotime')) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
          const response = await cache.match(request);
          const cachedAt = response.headers.get('sw-cached-at');
          
          // Supprimer si plus ancien que 7 jours
          if (cachedAt && (Date.now() - parseInt(cachedAt)) > 7 * 24 * 60 * 60 * 1000) {
            await cache.delete(request);
            console.log('🗑️ Cache expiré supprimé:', request.url);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Erreur nettoyage cache:', error);
  }
}

// Nettoyage automatique toutes les heures
setInterval(cleanExpiredCaches, 60 * 60 * 1000);

console.log('🏁 Service Worker ChronoTime v3.1 - MODE HORS-LIGNE OPTIMISÉ chargé avec succès');
