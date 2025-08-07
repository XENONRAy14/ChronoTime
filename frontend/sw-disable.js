// DÉSACTIVATION IMMÉDIATE ET COMPLÈTE DU SERVICE WORKER
console.log('🚨 DÉSACTIVATION FORCÉE DU SERVICE WORKER');

// Bloquer immédiatement toute installation de SW
if ('serviceWorker' in navigator) {
  // Désactiver tous les SW existants
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    registrations.forEach(function(registration) {
      console.log('🗑️ SUPPRESSION FORCÉE SW:', registration.scope);
      registration.unregister();
      // Forcer l'arrêt immédiat
      if (registration.active) {
        registration.active.postMessage({command: 'SKIP_WAITING'});
      }
    });
  });
  
  // Vider TOUS les caches immédiatement
  caches.keys().then(function(cacheNames) {
    cacheNames.forEach(function(cacheName) {
      console.log('🗑️ SUPPRESSION CACHE:', cacheName);
      caches.delete(cacheName);
    });
  });
  
  // Empêcher toute nouvelle registration
  const originalRegister = navigator.serviceWorker.register;
  navigator.serviceWorker.register = function() {
    console.log('🚫 BLOCAGE REGISTRATION SERVICE WORKER');
    return Promise.reject(new Error('Service Worker désactivé'));
  };
}

// Forcer le rechargement après nettoyage
setTimeout(() => {
  console.log('🔄 RECHARGEMENT FORCÉ POUR NETTOYER LE SW');
  window.location.reload(true);
}, 1000);

console.log('✅ DÉSACTIVATION SW TERMINÉE');
