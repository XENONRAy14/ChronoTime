// DÉSACTIVATION SIMPLE DU SERVICE WORKER - SANS RECHARGEMENT
console.log('🚨 DÉSACTIVATION SERVICE WORKER');

// Marquer que le nettoyage a été fait pour éviter les boucles
if (sessionStorage.getItem('sw-cleanup-done')) {
  console.log('✅ Nettoyage déjà effectué');
} else {
  sessionStorage.setItem('sw-cleanup-done', 'true');
  
  // Désactiver tous les SW existants
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      registrations.forEach(function(registration) {
        console.log('🗑️ Suppression SW:', registration.scope);
        registration.unregister();
      });
    });
    
    // Vider les caches
    if ('caches' in window) {
      caches.keys().then(function(cacheNames) {
        cacheNames.forEach(function(cacheName) {
          console.log('🗑️ Suppression cache:', cacheName);
          caches.delete(cacheName);
        });
      });
    }
    
    // Empêcher nouvelle registration
    const originalRegister = navigator.serviceWorker.register;
    navigator.serviceWorker.register = function() {
      console.log('🚫 Blocage registration SW');
      return Promise.reject(new Error('Service Worker désactivé'));
    };
  }
}

console.log('✅ Service Worker désactivé');
