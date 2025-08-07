// SCRIPT DE NETTOYAGE MANUEL À EXÉCUTER DANS LA CONSOLE DU NAVIGATEUR
// Copiez-collez ce code dans la console (F12) de votre navigateur sur le site

console.log('🚨 NETTOYAGE MANUEL DU SERVICE WORKER');

// Fonction de nettoyage complet
async function cleanupServiceWorker() {
  try {
    // 1. Désactiver tous les service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`🔍 Trouvé ${registrations.length} service worker(s)`);
      
      for (let registration of registrations) {
        console.log('🗑️ Suppression SW:', registration.scope);
        await registration.unregister();
      }
    }
    
    // 2. Vider tous les caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log(`🔍 Trouvé ${cacheNames.length} cache(s)`);
      
      for (let cacheName of cacheNames) {
        console.log('🗑️ Suppression cache:', cacheName);
        await caches.delete(cacheName);
      }
    }
    
    // 3. Vider le localStorage et sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    console.log('🗑️ Storage vidé');
    
    // 4. Forcer le rechargement
    console.log('✅ NETTOYAGE TERMINÉ - Rechargement...');
    setTimeout(() => {
      window.location.reload(true);
    }, 1000);
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
}

// Exécuter le nettoyage
cleanupServiceWorker();
