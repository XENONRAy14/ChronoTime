// SYSTÈME PWA (PROGRESSIVE WEB APP)
// Installation, offline mode, notifications push

const PWASystem = {
  
  // Configuration PWA
  config: {
    name: 'ChronoTime',
    shortName: 'ChronoTime',
    description: 'Application de chronométrage pour courses automobiles',
    version: '2.0.0',
    scope: '/',
    startUrl: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    backgroundColor: '#000000',
    themeColor: '#ff0000'
  },
  
  deferredPrompt: null,
  isInstalled: false,
  isOnline: navigator.onLine,
  
  // Initialisation du système PWA
  init() {
    console.log('🚀 Initialisation PWA System...');
    
    this.checkInstallation();
    this.createManifest();
    this.setupServiceWorker();
    this.createInstallPrompt();
    this.setupOfflineDetection();
    this.setupNotifications();
    this.createPWAControls();
    
    console.log('✅ PWA System initialisé');
  },
  
  // Vérifier si l'app est installée
  checkInstallation() {
    // Détecter si l'app est lancée en mode standalone
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone ||
                      document.referrer.includes('android-app://');
    
    if (this.isInstalled) {
      document.body.classList.add('pwa-installed');
      console.log('🏁 ChronoTime PWA est installée');
    }
  },
  
  // Créer le manifeste dynamiquement
  createManifest() {
    const manifest = {
      name: this.config.name,
      short_name: this.config.shortName,
      description: this.config.description,
      version: this.config.version,
      scope: this.config.scope,
      start_url: this.config.startUrl,
      display: this.config.display,
      orientation: this.config.orientation,
      background_color: this.config.backgroundColor,
      theme_color: this.config.themeColor,
      icons: [
        {
          src: this.generateIcon(192),
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: this.generateIcon(512),
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ],
      categories: ['sports', 'utilities', 'racing'],
      shortcuts: [
        {
          name: 'Nouveau Chrono',
          short_name: 'Chrono',
          description: 'Démarrer un nouveau chronométrage',
          url: '/?action=chrono',
          icons: [{ src: this.generateIcon(96), sizes: '96x96' }]
        },
        {
          name: 'Mes Courses',
          short_name: 'Courses',
          description: 'Voir mes courses',
          url: '/?action=courses',
          icons: [{ src: this.generateIcon(96), sizes: '96x96' }]
        }
      ]
    };
    
    // Créer le blob et l'URL du manifeste
    const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(manifestBlob);
    
    // Ajouter le lien vers le manifeste
    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = manifestURL;
  },
  
  // Générer une icône SVG
  generateIcon(size) {
    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#000000"/>
            <stop offset="100%" style="stop-color:#1a1a1a"/>
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#bg)"/>
        <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="none" stroke="#ff0000" stroke-width="4"/>
        <polygon points="${size/2-20},${size/2-10} ${size/2+20},${size/2-10} ${size/2+10},${size/2+15} ${size/2-10},${size/2+15}" fill="#ff0000"/>
        <text x="${size/2}" y="${size-20}" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="${size/8}" font-weight="bold">CT</text>
      </svg>
    `;
    
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
  },
  
  // Setup Service Worker
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      // Utiliser le fichier Service Worker externe (plus propre)
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('🔧 Service Worker enregistré:', registration.scope);
          
          // Écouter les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateAvailable();
              }
            });
          });
        })
        .catch(error => {
          console.error('❌ Erreur Service Worker:', error);
        });
    }
  },
  
  // Ancienne méthode inline (gardée en commentaire)
  setupServiceWorkerInline() {
    if ('serviceWorker' in navigator) {
      // Créer le service worker inline (peut causer des erreurs)
      const swCode = `
        const CACHE_NAME = 'chronotime-v2.0.0';
        const STATIC_CACHE = 'chronotime-static-v2.0.0';
        const DYNAMIC_CACHE = 'chronotime-dynamic-v2.0.0';
        
        const STATIC_FILES = [
          '/',
          '/index.html',
          '/index-debug.html',
          '/styles.css',
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
        
        // Installation
        self.addEventListener('install', event => {
          event.waitUntil(
            caches.open(STATIC_CACHE)
              .then(cache => {
                console.log('📦 Mise en cache des fichiers statiques');
                return cache.addAll(STATIC_FILES);
              })
              .then(() => self.skipWaiting())
          );
        });
        
        // Activation
        self.addEventListener('activate', event => {
          event.waitUntil(
            caches.keys().then(cacheNames => {
              return Promise.all(
                cacheNames.map(cacheName => {
                  if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                    console.log('🗑️ Suppression ancien cache:', cacheName);
                    return caches.delete(cacheName);
                  }
                })
              );
            }).then(() => self.clients.claim())
          );
        });
        
        // Fetch avec stratégie Cache First pour les statiques, Network First pour les API
        self.addEventListener('fetch', event => {
          const { request } = event;
          const url = new URL(request.url);
          
          // API requests - Network First
          if (url.pathname.startsWith('/api/')) {
            event.respondWith(
              fetch(request)
                .then(response => {
                  if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE).then(cache => {
                      cache.put(request, responseClone);
                    });
                  }
                  return response;
                })
                .catch(() => {
                  return caches.match(request);
                })
            );
            return;
          }
          
          // Static files - Cache First
          event.respondWith(
            caches.match(request)
              .then(response => {
                if (response) {
                  return response;
                }
                
                return fetch(request)
                  .then(response => {
                    if (response.ok && request.method === 'GET') {
                      const responseClone = response.clone();
                      caches.open(DYNAMIC_CACHE).then(cache => {
                        cache.put(request, responseClone);
                      });
                    }
                    return response;
                  });
              })
              .catch(() => {
                // Fallback pour les pages
                if (request.mode === 'navigate') {
                  return caches.match('/index.html');
                }
              })
          );
        });
        
        // Background Sync
        self.addEventListener('sync', event => {
          if (event.tag === 'background-sync-chronos') {
            event.waitUntil(syncChronos());
          }
        });
        
        // Push notifications
        self.addEventListener('push', event => {
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
        
        // Notification click
        self.addEventListener('notificationclick', event => {
          event.notification.close();
          
          if (event.action === 'explore') {
            event.waitUntil(
              clients.openWindow('/')
            );
          }
        });
        
        // Sync chronos function
        async function syncChronos() {
          try {
            const cache = await caches.open(DYNAMIC_CACHE);
            const requests = await cache.keys();
            const pendingRequests = requests.filter(req => 
              req.url.includes('/api/chronos') && req.method === 'POST'
            );
            
            for (const request of pendingRequests) {
              try {
                await fetch(request);
                await cache.delete(request);
              } catch (error) {
                console.error('Erreur sync chrono:', error);
              }
            }
          } catch (error) {
            console.error('Erreur background sync:', error);
          }
        } catch (error) {
          console.error('Erreur background sync:', error);
        }
      // Cette méthode est désormais obsolète - utiliser setupServiceWorker() à la place
      console.warn('⚠️ Méthode Service Worker inline obsolète - utilisation du fichier externe');
    }
  },
  
  // Créer le prompt d'installation
  createInstallPrompt() {
    // Écouter l'événement beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });
    
    // Écouter l'installation
    window.addEventListener('appinstalled', () => {
      console.log('🎉 ChronoTime PWA installée avec succès');
      this.isInstalled = true;
      this.hideInstallButton();
      
      if (window.UXImprovements) {
        window.UXImprovements.showToast('ChronoTime installé avec succès ! 🏁', 'success');
      }
    });
  },
  
  // Afficher le bouton d'installation
  showInstallButton() {
    if (this.isInstalled) return;
    
    const installBtn = document.createElement('button');
    installBtn.id = 'pwa-install-btn';
    installBtn.className = 'pwa-install-btn';
    installBtn.innerHTML = '📱 Installer';
    installBtn.setAttribute('aria-label', 'Installer ChronoTime');
    installBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #ff0000, #cc0000);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      font-weight: bold;
      cursor: pointer;
      z-index: 1000;
      box-shadow: 0 4px 15px rgba(255, 0, 0, 0.3);
      animation: pulse 2s infinite;
    `;
    
    installBtn.addEventListener('click', () => {
      this.installApp();
    });
    
    document.body.appendChild(installBtn);
  },
  
  // Masquer le bouton d'installation
  hideInstallButton() {
    const btn = document.getElementById('pwa-install-btn');
    if (btn) {
      btn.remove();
    }
  },
  
  // Installer l'application
  async installApp() {
    if (!this.deferredPrompt) return;
    
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ Installation acceptée');
    } else {
      console.log('❌ Installation refusée');
    }
    
    this.deferredPrompt = null;
    this.hideInstallButton();
  },
  
  // Setup détection offline/online
  setupOfflineDetection() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.hideOfflineIndicator();
      
      if (window.UXImprovements) {
        window.UXImprovements.showToast('Connexion rétablie 🌐', 'success');
      }
      
      // Synchroniser les données en attente
      this.syncPendingData();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showOfflineIndicator();
      
      if (window.UXImprovements) {
        window.UXImprovements.showToast('Mode hors ligne 📴', 'warning');
      }
    });
    
    // Vérifier l'état initial
    if (!this.isOnline) {
      this.showOfflineIndicator();
    }
  },
  
  // Afficher l'indicateur hors ligne
  showOfflineIndicator() {
    let indicator = document.getElementById('offline-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'offline-indicator';
      indicator.innerHTML = '📴 Mode hors ligne';
      indicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ff6600;
        color: white;
        text-align: center;
        padding: 8px;
        font-weight: bold;
        z-index: 10000;
        animation: slideInFromTop 0.3s ease;
      `;
      document.body.appendChild(indicator);
    }
  },
  
  // Masquer l'indicateur hors ligne
  hideOfflineIndicator() {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      indicator.style.animation = 'slideOutToTop 0.3s ease forwards';
      setTimeout(() => indicator.remove(), 300);
    }
  },
  
  // Setup notifications
  setupNotifications() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      // Demander la permission
      if (Notification.permission === 'default') {
        this.requestNotificationPermission();
      }
    }
  },
  
  // Demander permission notifications
  async requestNotificationPermission() {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notifications autorisées');
      if (window.UXImprovements) {
        window.UXImprovements.showToast('Notifications activées 🔔', 'success');
      }
    }
  },
  
  // Envoyer une notification
  sendNotification(title, options = {}) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [100, 50, 100],
        ...options
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  },
  
  // Synchroniser les données en attente
  async syncPendingData() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('background-sync-chronos');
    }
  },
  
  // Créer les contrôles PWA
  createPWAControls() {
    // Ajouter les styles d'animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInFromTop {
        from { transform: translateY(-100%); }
        to { transform: translateY(0); }
      }
      
      @keyframes slideOutToTop {
        from { transform: translateY(0); }
        to { transform: translateY(-100%); }
      }
      
      .pwa-install-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(255, 0, 0, 0.4);
      }
    `;
    document.head.appendChild(style);
  },
  
  // Afficher notification de mise à jour
  showUpdateAvailable() {
    if (window.UXImprovements) {
      window.UXImprovements.showToast(
        'Mise à jour disponible ! Rechargez la page.',
        'info',
        8000
      );
    }
  },
  
  // Vérifier si l'app est installée
  isAppInstalled() {
    return this.isInstalled;
  },
  
  // Obtenir l'état de la connexion
  getConnectionStatus() {
    return this.isOnline;
  }
};

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
  PWASystem.init();
});

// Export global
window.PWASystem = PWASystem;
