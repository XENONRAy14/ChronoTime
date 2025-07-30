// PWA SYSTEM CHRONOTIME v2.0 - VERSION PROPRE
// Progressive Web App avec installation, offline et notifications

const PWASystem = {
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
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      console.log('📱 App déjà installée');
    }
  },
  
  // Créer le manifeste dynamiquement
  createManifest() {
    const manifest = {
      name: "ChronoTime - Chronométrage Racing",
      short_name: "ChronoTime",
      description: "Application de chronométrage pour courses automobiles avec thème Initial D",
      start_url: "/",
      display: "standalone",
      background_color: "#000000",
      theme_color: "#ff0000",
      orientation: "portrait-primary",
      categories: ["sports", "racing", "timing"],
      lang: "fr-FR",
      icons: [
        {
          src: "data:image/svg+xml;base64," + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
              <rect width="192" height="192" fill="#000"/>
              <circle cx="96" cy="96" r="80" fill="none" stroke="#ff0000" stroke-width="8"/>
              <text x="96" y="110" text-anchor="middle" fill="#ff0000" font-size="24" font-weight="bold">CT</text>
              <text x="96" y="130" text-anchor="middle" fill="#ff6600" font-size="12">RACING</text>
            </svg>
          `),
          sizes: "192x192",
          type: "image/svg+xml"
        },
        {
          src: "data:image/svg+xml;base64," + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <rect width="512" height="512" fill="#000"/>
              <circle cx="256" cy="256" r="200" fill="none" stroke="#ff0000" stroke-width="20"/>
              <text x="256" y="280" text-anchor="middle" fill="#ff0000" font-size="64" font-weight="bold">CT</text>
              <text x="256" y="320" text-anchor="middle" fill="#ff6600" font-size="32">RACING</text>
            </svg>
          `),
          sizes: "512x512",
          type: "image/svg+xml"
        }
      ]
    };
    
    const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(manifestBlob);
    
    let link = document.querySelector('link[rel="manifest"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    link.href = manifestURL;
    
    console.log('📋 Manifeste PWA créé');
  },
  
  // Setup Service Worker (fichier externe)
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
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
  
  // Créer le prompt d'installation
  createInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });
    
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.hideInstallButton();
      console.log('🎉 App installée avec succès !');
      
      if (window.UXImprovements) {
        window.UXImprovements.showToast('🎉 ChronoTime installé !', 'success');
      }
    });
  },
  
  // Afficher le bouton d'installation
  showInstallButton() {
    if (this.isInstalled) return;
    
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
      installBtn.style.display = 'block';
      installBtn.classList.add('animate-bounce-in');
    }
  },
  
  // Masquer le bouton d'installation
  hideInstallButton() {
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
      installBtn.style.display = 'none';
    }
  },
  
  // Installer l'app
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
  },
  
  // Détection online/offline
  setupOfflineDetection() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showOnlineStatus();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showOfflineStatus();
    });
  },
  
  // Afficher statut online
  showOnlineStatus() {
    if (window.UXImprovements) {
      window.UXImprovements.showToast('🌐 Connexion rétablie', 'success');
    }
    
    const offlineIndicator = document.getElementById('offline-indicator');
    if (offlineIndicator) {
      offlineIndicator.style.display = 'none';
    }
  },
  
  // Afficher statut offline
  showOfflineStatus() {
    if (window.UXImprovements) {
      window.UXImprovements.showToast('📴 Mode hors ligne', 'warning');
    }
    
    let offlineIndicator = document.getElementById('offline-indicator');
    if (!offlineIndicator) {
      offlineIndicator = document.createElement('div');
      offlineIndicator.id = 'offline-indicator';
      offlineIndicator.innerHTML = '📴 Hors ligne';
      offlineIndicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #ff6600;
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        z-index: 10000;
        animation: pulse 2s infinite;
      `;
      document.body.appendChild(offlineIndicator);
    }
    offlineIndicator.style.display = 'block';
  },
  
  // Setup notifications
  setupNotifications() {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        // Demander permission après 30 secondes
        setTimeout(() => {
          this.requestNotificationPermission();
        }, 30000);
      }
    }
  },
  
  // Demander permission notifications
  async requestNotificationPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('🔔 Notifications autorisées');
        this.showWelcomeNotification();
      }
    } catch (error) {
      console.error('Erreur notifications:', error);
    }
  },
  
  // Notification de bienvenue
  showWelcomeNotification() {
    if (Notification.permission === 'granted') {
      new Notification('🏁 ChronoTime', {
        body: 'Notifications activées ! Vous recevrez les mises à jour importantes.',
        icon: '/icon-192.png',
        badge: '/badge-72.png'
      });
    }
  },
  
  // Créer les contrôles PWA
  createPWAControls() {
    // Bouton d'installation
    if (!document.getElementById('pwa-install-btn')) {
      const installBtn = document.createElement('button');
      installBtn.id = 'pwa-install-btn';
      installBtn.innerHTML = '📱 Installer ChronoTime';
      installBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(45deg, #ff0000, #ff6600);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        font-weight: bold;
        cursor: pointer;
        z-index: 9999;
        display: none;
        box-shadow: 0 4px 15px rgba(255, 0, 0, 0.3);
        transition: all 0.3s ease;
      `;
      
      installBtn.addEventListener('click', () => this.installApp());
      installBtn.addEventListener('mouseenter', () => {
        installBtn.style.transform = 'scale(1.05)';
        installBtn.style.boxShadow = '0 6px 20px rgba(255, 0, 0, 0.4)';
      });
      installBtn.addEventListener('mouseleave', () => {
        installBtn.style.transform = 'scale(1)';
        installBtn.style.boxShadow = '0 4px 15px rgba(255, 0, 0, 0.3)';
      });
      
      document.body.appendChild(installBtn);
    }
  },
  
  // Afficher mise à jour disponible
  showUpdateAvailable() {
    if (window.UXImprovements) {
      window.UXImprovements.showToast('🔄 Mise à jour disponible ! Rechargez la page.', 'info', 10000);
    }
  }
};

// Export global
window.PWASystem = PWASystem;

// Auto-initialisation
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => PWASystem.init());
} else {
  PWASystem.init();
}

console.log('🏁 PWA System ChronoTime v2.0 chargé');
