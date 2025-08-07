// Script pour désactiver complètement le service worker
console.log('🚫 Désactivation du Service Worker...');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister().then(function(boolean) {
        console.log('✅ Service Worker désactivé:', boolean);
      });
    }
  });
}

// Vider tous les caches
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
      console.log('🗑️ Cache supprimé:', name);
    }
  });
}

console.log('✅ Service Worker complètement désactivé');
