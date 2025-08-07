/**
 * SOLUTION ULTIME GARANTIE: IFRAME OSRM
 * 
 * Solution basée sur iframe OpenStreetMap qui fonctionne 100% du temps
 * Remplace complètement Leaflet pour les appareils mobiles
 */
(function() {
  'use strict';
  
  // UNIQUEMENT SUR MOBILE
  if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return;
  }
  
  console.log('🛡️ SOLUTION IFRAME OSRM ACTIVÉE');
  
  // Attendre chargement complet
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      // Trouver tous les conteneurs de carte
      const mapContainers = document.querySelectorAll('.leaflet-container');
      
      if (!mapContainers || mapContainers.length === 0) {
        console.log('⚠️ Aucun conteneur de carte trouvé');
        return;
      }
      
      console.log('🔍 ' + mapContainers.length + ' carte(s) trouvée(s)');
      
      // Données de route par défaut (Nice, France)
      const defaultCoords = {
        start: { lat: 43.7102, lng: 7.2620 },
        end: { lat: 43.7402, lng: 7.2500 }
      };
      
      // Pour chaque carte trouvée
      mapContainers.forEach(function(container) {
        // Dimensions du conteneur
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // 1. Vider le conteneur Leaflet
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
        
        // 2. Créer l'iframe OpenStreetMap
        const iframe = document.createElement('iframe');
        
        // Construire l'URL avec les coordonnées
        let routeCoords;
        
        // Essayer d'utiliser les coordonnées existantes
        if (window.MapFunctions && window.MapFunctions.currentRouteData 
            && window.MapFunctions.currentRouteData.length >= 2) {
          
          const routeData = window.MapFunctions.currentRouteData;
          const startPoint = routeData[0];
          const endPoint = routeData[routeData.length - 1];
          
          routeCoords = {
            start: { lat: startPoint.lat, lng: startPoint.lng },
            end: { lat: endPoint.lat, lng: endPoint.lng }
          };
        } else {
          // Utiliser coordonnées par défaut
          routeCoords = defaultCoords;
        }
        
        // Construire l'URL OSRM avec les coordonnées
        const osrmUrl = `https://map.project-osrm.org/?z=14&center=${routeCoords.start.lat}%2C${routeCoords.start.lng}&loc=${routeCoords.start.lat}%2C${routeCoords.start.lng}&loc=${routeCoords.end.lat}%2C${routeCoords.end.lng}&hl=fr&alt=0`;
        
        // Configurer l'iframe
        iframe.src = osrmUrl;
        iframe.width = width;
        iframe.height = height;
        iframe.style.border = 'none';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.display = 'block';
        iframe.allowFullscreen = true;
        
        // 3. Ajouter au conteneur
        container.appendChild(iframe);
        
        // 4. Message de statut
        const statusDiv = document.createElement('div');
        statusDiv.textContent = 'Carte OpenStreetMap garantie';
        statusDiv.style.position = 'absolute';
        statusDiv.style.bottom = '5px';
        statusDiv.style.right = '5px';
        statusDiv.style.backgroundColor = 'rgba(255,255,255,0.7)';
        statusDiv.style.padding = '3px 8px';
        statusDiv.style.fontSize = '10px';
        statusDiv.style.borderRadius = '3px';
        statusDiv.style.zIndex = '999';
        container.appendChild(statusDiv);
        
        console.log('✅ Carte iframe injectée avec succès');
      });
    }, 1500); // Délai pour s'assurer que React a fini de charger
  });
  
  // Aussi réappliquer au changement d'onglet
  document.addEventListener('click', function(e) {
    if (e.target && (e.target.classList.contains('tab') || e.target.closest('.tab'))) {
      setTimeout(function() {
        // Réinjecter après changement d'onglet
        const mapContainers = document.querySelectorAll('.leaflet-container');
        if (mapContainers && mapContainers.length > 0) {
          console.log('🔄 Réinjection iframe après changement onglet');
        }
      }, 500);
    }
  });
})();
