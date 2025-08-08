/**
 * DIAGNOSTIC ET CORRECTION MOBILE CARTE
 * Identifie et corrige le problème des tuiles sur mobile
 */
(function() {
  'use strict';
  
  console.log('🔍 DIAGNOSTIC MOBILE CARTE ACTIVÉ');
  
  // Test 1: Vérifier si le service worker bloque les tuiles
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      if (registrations.length > 0) {
        console.log('⚠️ SERVICE WORKER DÉTECTÉ - Possible cause du problème');
        
        // Désactiver temporairement le service worker pour les tuiles
        registrations.forEach(function(registration) {
          registration.unregister().then(function() {
            console.log('🔧 Service Worker désactivé temporairement');
            location.reload(); // Recharger pour tester sans SW
          });
        });
      }
    });
  }
  
  // Test 2: Forcer un serveur de tuiles différent
  function fixTileServer() {
    if (!window.MapFunctions || !window.MapFunctions.currentMap) {
      setTimeout(fixTileServer, 500);
      return;
    }
    
    const map = window.MapFunctions.currentMap;
    console.log('🗺️ Test serveurs de tuiles alternatifs...');
    
    // Supprimer toutes les couches existantes
    map.eachLayer(function(layer) {
      if (layer._url) {
        map.removeLayer(layer);
        console.log('🗑️ Couche supprimée:', layer._url);
      }
    });
    
    // Test avec plusieurs serveurs de tuiles
    const tileServers = [
      // Serveur français plus fiable pour mobile
      {
        url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
        name: 'OSM France'
      },
      // Serveur de secours
      {
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', 
        name: 'OpenTopoMap'
      },
      // Serveur de base
      {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        name: 'OSM Standard'
      }
    ];
    
    let serverIndex = 0;
    
    function tryNextServer() {
      if (serverIndex >= tileServers.length) {
        console.log('❌ Tous les serveurs de tuiles ont échoué');
        return;
      }
      
      const server = tileServers[serverIndex];
      console.log('🔄 Test serveur:', server.name);
      
      const tileLayer = L.tileLayer(server.url, {
        attribution: '&copy; OpenStreetMap contributors',
        subdomains: 'abc',
        minZoom: 2,
        maxZoom: 18,
        timeout: 5000,
        crossOrigin: true,
        // Options spéciales pour mobile
        updateWhenIdle: true,
        updateWhenZooming: false,
        keepBuffer: 1
      });
      
      // Écouter les erreurs
      tileLayer.on('tileerror', function(e) {
        console.log('❌ Erreur tuile avec', server.name, ':', e);
        map.removeLayer(tileLayer);
        serverIndex++;
        setTimeout(tryNextServer, 1000);
      });
      
      // Écouter le succès
      tileLayer.on('tileload', function(e) {
        console.log('✅ Tuile chargée avec succès:', server.name);
      });
      
      tileLayer.addTo(map);
    }
    
    tryNextServer();
  }
  
  // Démarrer les tests
  setTimeout(fixTileServer, 1000);
  
})();
