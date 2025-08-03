/* PWA INSTALLATION ET SERVICE WORKER - CHRONOTIME v3.0 */

// Variables globales pour la PWA
let deferredPrompt;
let isInstalled = false;

// Initialisation de la PWA
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation PWA ChronoTime...');
    
    // Enregistrer le service worker
    registerServiceWorker();
    
    // Détecter si l'app est déjà installée
    detectInstallation();
    
    // Gérer l'événement d'installation
    setupInstallPrompt();
    
    // Créer le bouton d'installation
    createInstallButton();
    
    // Surveiller le statut de connexion
    monitorNetworkStatus();
    
    console.log('✅ PWA ChronoTime initialisée avec succès');
});

// Enregistrement du service worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            
            console.log('✅ Service Worker enregistré:', registration.scope);
            
            // Écouter les mises à jour
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showUpdateNotification();
                    }
                });
            });
            
            // Forcer l'activation du nouveau SW
            if (registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            
        } catch (error) {
            console.error('❌ Erreur enregistrement Service Worker:', error);
        }
    } else {
        console.warn('⚠️ Service Worker non supporté par ce navigateur');
    }
}

// Détection si l'app est installée
function detectInstallation() {
    // Vérifier si l'app est en mode standalone (installée)
    if (window.matchMedia('(display-mode: standalone)').matches) {
        isInstalled = true;
        console.log('📱 App installée détectée');
        document.body.classList.add('pwa-installed');
    }
    
    // Vérifier via l'API Web App Manifest (si supportée)
    if ('getInstalledRelatedApps' in navigator) {
        navigator.getInstalledRelatedApps().then(apps => {
            if (apps.length > 0) {
                isInstalled = true;
                console.log('📱 App installée via getInstalledRelatedApps');
            }
        });
    }
}

// Configuration de l'invite d'installation
function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('💾 Événement d\'installation PWA détecté');
        
        // Empêcher l'affichage automatique
        e.preventDefault();
        
        // Sauvegarder l'événement pour plus tard
        deferredPrompt = e;
        
        // Afficher le bouton d'installation
        showInstallButton();
    });
    
    // Écouter l'installation réussie
    window.addEventListener('appinstalled', () => {
        console.log('🎉 PWA installée avec succès !');
        isInstalled = true;
        hideInstallButton();
        showInstallSuccessMessage();
        
        // Analyser l'installation (optionnel)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'pwa_install', {
                event_category: 'PWA',
                event_label: 'ChronoTime'
            });
        }
    });
}

// Création du bouton d'installation
function createInstallButton() {
    const installButton = document.createElement('button');
    installButton.id = 'pwa-install-btn';
    installButton.innerHTML = '📱 Installer l\'app';
    installButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        border: none;
        border-radius: 50px;
        padding: 12px 20px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
        z-index: 10000;
        display: none;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
    `;
    
    installButton.addEventListener('mouseenter', () => {
        installButton.style.transform = 'translateY(-2px) scale(1.05)';
        installButton.style.boxShadow = '0 6px 25px rgba(76, 175, 80, 0.4)';
    });
    
    installButton.addEventListener('mouseleave', () => {
        installButton.style.transform = 'translateY(0) scale(1)';
        installButton.style.boxShadow = '0 4px 20px rgba(76, 175, 80, 0.3)';
    });
    
    installButton.addEventListener('click', installPWA);
    
    document.body.appendChild(installButton);
}

// Afficher le bouton d'installation
function showInstallButton() {
    const button = document.getElementById('pwa-install-btn');
    if (button && !isInstalled) {
        button.style.display = 'block';
        
        // Animation d'apparition
        setTimeout(() => {
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        }, 100);
    }
}

// Masquer le bouton d'installation
function hideInstallButton() {
    const button = document.getElementById('pwa-install-btn');
    if (button) {
        button.style.display = 'none';
    }
}

// Installation de la PWA
async function installPWA() {
    if (!deferredPrompt) {
        console.warn('⚠️ Aucune invite d\'installation disponible');
        return;
    }
    
    try {
        // Afficher l'invite d'installation
        deferredPrompt.prompt();
        
        // Attendre la réponse de l'utilisateur
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('✅ Utilisateur a accepté l\'installation');
        } else {
            console.log('❌ Utilisateur a refusé l\'installation');
        }
        
        // Nettoyer l'invite
        deferredPrompt = null;
        hideInstallButton();
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'installation:', error);
    }
}

// Message de succès d'installation
function showInstallSuccessMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        font-weight: 600;
        box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
        z-index: 10001;
        animation: slideInRight 0.5s ease;
    `;
    message.innerHTML = '🎉 ChronoTime installé avec succès !';
    
    document.body.appendChild(message);
    
    // Supprimer après 5 secondes
    setTimeout(() => {
        message.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => message.remove(), 500);
    }, 5000);
}

// Notification de mise à jour disponible
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #2196F3, #1976D2);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        font-weight: 600;
        box-shadow: 0 4px 20px rgba(33, 150, 243, 0.3);
        z-index: 10001;
        cursor: pointer;
        animation: slideInDown 0.5s ease;
    `;
    notification.innerHTML = '🔄 Mise à jour disponible - Cliquer pour actualiser';
    
    notification.addEventListener('click', () => {
        window.location.reload();
    });
    
    document.body.appendChild(notification);
    
    // Supprimer après 10 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOutUp 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 10000);
}

// Surveillance du statut réseau
function monitorNetworkStatus() {
    const updateOnlineStatus = () => {
        const status = navigator.onLine ? 'en ligne' : 'hors ligne';
        console.log(`🌐 Statut réseau: ${status}`);
        
        // Afficher un indicateur visuel
        showNetworkStatus(!navigator.onLine);
        
        // Déclencher des événements personnalisés
        document.dispatchEvent(new CustomEvent('networkstatuschange', {
            detail: { online: navigator.onLine }
        }));
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Vérification initiale
    updateOnlineStatus();
}

// Affichage du statut réseau
function showNetworkStatus(isOffline) {
    let statusIndicator = document.getElementById('network-status');
    
    if (!statusIndicator) {
        statusIndicator = document.createElement('div');
        statusIndicator.id = 'network-status';
        statusIndicator.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            z-index: 10002;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;
        document.body.appendChild(statusIndicator);
    }
    
    if (isOffline) {
        statusIndicator.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)';
        statusIndicator.style.color = 'white';
        statusIndicator.innerHTML = '📴 Mode hors-ligne';
        statusIndicator.style.display = 'block';
    } else {
        statusIndicator.style.display = 'none';
    }
}

// Styles CSS pour les animations
const pwaStyles = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes slideInDown {
        from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    
    @keyframes slideOutUp {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    }
    
    .pwa-installed {
        /* Styles spécifiques pour l'app installée */
    }
`;

// Injecter les styles
const styleSheet = document.createElement('style');
styleSheet.textContent = pwaStyles;
document.head.appendChild(styleSheet);

console.log('📱 PWA Install Script ChronoTime v3.0 chargé avec succès');
