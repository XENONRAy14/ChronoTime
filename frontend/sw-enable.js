// RÉACTIVATION DU SERVICE WORKER CORRIGÉ
console.log('🔄 RÉACTIVATION SERVICE WORKER CORRIGÉ');

// Vérifier que le nettoyage a été fait
if (sessionStorage.getItem('sw-cleanup-done')) {
  sessionStorage.removeItem('sw-cleanup-done');
  console.log('✅ Nettoyage précédent supprimé');
}

// Réactiver le service worker avec la version corrigée
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', {
    scope: '/',
    updateViaCache: 'none' // Forcer le rechargement du SW
  })
  .then(registration => {
    console.log('✅ Service Worker corrigé enregistré:', registration.scope);
    
    // Forcer la mise à jour si une nouvelle version est disponible
    registration.addEventListener('updatefound', () => {
      console.log('🔄 Nouvelle version du SW détectée');
      const newWorker = registration.installing;
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          console.log('✅ Nouvelle version du SW installée');
          // Optionnel: recharger la page pour activer la nouvelle version
          // window.location.reload();
        }
      });
    });
  })
  .catch(error => {
    console.error('❌ Erreur enregistrement SW:', error);
  });
  
  // Écouter les messages du service worker
  navigator.serviceWorker.addEventListener('message', event => {
    console.log('📨 Message du SW:', event.data);
  });
} else {
  console.warn('⚠️ Service Worker non supporté');
}

console.log('🏁 Service Worker corrigé activé');
