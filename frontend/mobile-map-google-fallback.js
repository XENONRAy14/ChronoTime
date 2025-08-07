/**
 * SOLUTION DE SECOURS RADICALE: GOOGLE MAPS SUR MOBILE
 * 
 * Remplace complètement la carte Leaflet par Google Maps sur mobile
 * pour garantir l'affichage d'une carte fonctionnelle
 */
(function() {
  'use strict';
  
  // Uniquement sur mobile
  if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return;
  }
  
  console.log('🚨 Solution Google Maps pour mobile activée');
  
  // Attendre le chargement du DOM
  document.addEventListener('DOMContentLoaded', function() {
    // Injecter l'API Google Maps
    const googleMapsScript = document.createElement('script');
    googleMapsScript.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBx0YAGhT-F0spcCO0voUxRfyA1mWk4lMY&callback=initGoogleMap';
    googleMapsScript.defer = true;
    googleMapsScript.async = true;
    document.head.appendChild(googleMapsScript);
    
    // Fonction d'initialisation pour Google Maps (sera appelée par le callback)
    window.initGoogleMap = function() {
      // Trouver tous les conteneurs de carte Leaflet
      const mapContainers = document.querySelectorAll('.leaflet-container');
      
      if (mapContainers.length === 0) {
        console.log('⚠️ Aucun conteneur de carte trouvé');
        return;
      }
      
      // Pour chaque conteneur de carte
      mapContainers.forEach((container, index) => {
        // Créer un nouveau conteneur pour Google Maps
        const googleMapContainer = document.createElement('div');
        googleMapContainer.id = 'google-map-' + index;
        googleMapContainer.style.width = '100%';
        googleMapContainer.style.height = '100%';
        googleMapContainer.style.position = 'absolute';
        googleMapContainer.style.top = '0';
        googleMapContainer.style.left = '0';
        googleMapContainer.style.zIndex = '999';
        
        // Remplacer Leaflet par notre conteneur Google Maps
        container.style.overflow = 'hidden';
        container.appendChild(googleMapContainer);
        
        // Position par défaut (Nice, France)
        const defaultCenter = { lat: 43.7102, lng: 7.2620 };
        
        // Créer la carte Google Maps
        const map = new google.maps.Map(googleMapContainer, {
          center: defaultCenter,
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: true,
          fullscreenControl: false,
          gestureHandling: 'greedy' // Pour permettre le zoom avec un seul doigt
        });
        
        // Si nous avons des données de route disponibles
        if (window.MapFunctions && window.MapFunctions.currentRouteData) {
          try {
            const routeData = window.MapFunctions.currentRouteData;
            const path = [];
            
            // Convertir les coordonnées Leaflet au format Google Maps
            routeData.forEach(point => {
              if (point.lat && point.lng) {
                path.push({
                  lat: parseFloat(point.lat),
                  lng: parseFloat(point.lng)
                });
              }
            });
            
            // Créer la polyligne pour le tracé
            if (path.length > 0) {
              const route = new google.maps.Polyline({
                path: path,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 3
              });
              
              route.setMap(map);
              
              // Centrer la carte sur le tracé
              const bounds = new google.maps.LatLngBounds();
              path.forEach(point => bounds.extend(point));
              map.fitBounds(bounds);
            }
          } catch (e) {
            console.error('Erreur lors du tracé de la route:', e);
          }
        }
        
        // Message de crédit
        const creditDiv = document.createElement('div');
        creditDiv.style.position = 'absolute';
        creditDiv.style.bottom = '5px';
        creditDiv.style.right = '5px';
        creditDiv.style.backgroundColor = 'rgba(255,255,255,0.7)';
        creditDiv.style.padding = '2px 5px';
        creditDiv.style.borderRadius = '3px';
        creditDiv.style.fontSize = '10px';
        creditDiv.innerHTML = 'ChronoTime Maps';
        googleMapContainer.appendChild(creditDiv);
      });
    };
  });
})();
