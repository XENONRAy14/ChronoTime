// Fonction pour initialiser la carte Leaflet
function initMap() {
  console.log('Map script loaded');
}

// Fonction pour exposer les fonctions de carte à React
window.MapFunctions = {
  currentMap: null,
  markers: [],
  polyline: null,
  searchControl: null,
  
  // Fonctions utilitaires pour créer des icônes de marqueur
  createStartIcon: function() {
    return L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  },
  
  createEndIcon: function() {
    return L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  },
  
  createWaypointIcon: function() {
    return L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  },
  
  // Initialiser la carte dans un élément DOM spécifique
  createMap: function(elementId, options = {}) {
    const defaultOptions = {
      center: [45.899977, 6.172652], // Mont Blanc par défaut
      zoom: 12
    };
    
    const mapOptions = { ...defaultOptions, ...options };
    const mapElement = document.getElementById(elementId);
    
    if (!mapElement) {
      console.error(`Element with id ${elementId} not found`);
      return null;
    }
    
    // Vider l'élément DOM pour éviter les problèmes de superposition
    mapElement.innerHTML = '';
    
    // Créer une carte Leaflet
    const map = L.map(elementId).setView(mapOptions.center, mapOptions.zoom);
    
    // 2. Configuration tuiles selon plateforme - TEST SERVEURS MULTIPLES
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Serveur de tuiles différent pour mobile (plus fiable)
    const tileUrl = isMobile ? 
      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' : 
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const attribution = isMobile ? 
      '&copy; OpenTopoMap contributors' : 
      '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
    
    const tileLayer = L.tileLayer(tileUrl, {
      attribution: attribution,
      maxZoom: 19,
      updateWhenIdle: false,
      updateWhenZooming: true,
      keepBuffer: 2,
      detectRetina: true
    });
    
    // Ajouter gestion des erreurs de chargement des tuiles
    tileLayer.on('tileerror', function(error) {
      console.error('❌ Erreur chargement tuile:', error.url, error.error);
    });
    
    tileLayer.on('tileload', function(event) {
      console.debug('✅ Tuile chargée:', event.url);
    });
    
    // 3. Ajouter la couche unique à la carte
    tileLayer.addTo(map);
    
    // 4. Configuration identique desktop/mobile - SIMPLE
    console.log('🗺️ Carte initialisée avec', isMobile ? 'OpenTopoMap (mobile)' : 'OpenStreetMap (desktop)');
    
    // Stocker la référence à la carte
    this.currentMap = map;
    
    // Initialiser les tableaux pour stocker les marqueurs et le tracé
    this.markers = [];
    this.polyline = null;
    
    return map;
  },
  
  // Ajouter un marqueur à la carte
  addMarker: function(position, title, iconOptions, draggable = true) {
    if (!this.currentMap) {
      console.error('Map not initialized');
      return null;
    }
    
    // Convertir la position au format Leaflet si nécessaire
    const latLng = position.lat && position.lng ? 
      [position.lat, position.lng] : position;
    
    // Créer un marqueur Leaflet
    const marker = L.marker(latLng, {
      title,
      draggable,
      icon: iconOptions.icon
    }).addTo(this.currentMap);
    
    // Ajouter une popup avec le titre
    marker.bindPopup(title);
    
    this.markers.push(marker);
    
    // Mettre à jour le tracé lorsqu'un marqueur est déplacé
    marker.on('dragend', () => {
      this.updatePolyline();
    });
    
    // Mettre à jour le tracé
    this.updatePolyline();
    
    return true;
  },
  
  // Ajouter un marqueur de départ
  addStartMarker: function(position) {
    // Si aucune position n'est spécifiée, utiliser le centre de la carte
    if (!position && this.currentMap) {
      position = this.currentMap.getCenter();
    }
    
    // Utiliser la fonction utilitaire pour créer l'icône de départ
    const startIcon = this.createStartIcon();
    
    return this.addMarker(
      position,
      'Départ',
      { icon: startIcon }
    );
  },
  
  // Ajouter un marqueur d'arrivée
  addEndMarker: function(position) {
    // Si aucune position n'est spécifiée, utiliser le centre de la carte
    if (!position && this.currentMap) {
      position = this.currentMap.getCenter();
    }
    
    // Utiliser la fonction utilitaire pour créer l'icône d'arrivée
    const endIcon = this.createEndIcon();
    
    return this.addMarker(
      position,
      'Arrivée',
      { icon: endIcon }
    );
  },
  
  // Ajouter un point intermédiaire
  addWaypointMarker: function(position) {
    // Si aucune position n'est spécifiée, utiliser le centre de la carte
    if (!position && this.currentMap) {
      position = this.currentMap.getCenter();
    }
    
    // Utiliser la fonction utilitaire pour créer l'icône de point intermédiaire
    const waypointIcon = this.createWaypointIcon();
    
    return this.addMarker(
      position,
      'Point intermédiaire',
      { icon: waypointIcon }
    );
  },
  
  // Mettre à jour le tracé en fonction des marqueurs
  updatePolyline: function() {
    // Supprimer l'ancien tracé s'il existe
    if (this.polyline) {
      this.currentMap.removeLayer(this.polyline);
    }
    
    // S'il y a moins de 2 marqueurs, ne pas créer de tracé
    if (this.markers.length < 2) {
      return;
    }
    
    // Récupérer les positions des marqueurs
    const latlngs = this.markers.map(marker => marker.getLatLng());
    
    // Créer un tracé temporaire en ligne droite pendant le chargement
    const tempPolyline = L.polyline(latlngs, {
      color: '#FF0000',
      weight: 3,
      opacity: 0.5,
      dashArray: '5, 10'
    }).addTo(this.currentMap);
    
    // Ajuster la vue pour voir tout le tracé
    this.currentMap.fitBounds(tempPolyline.getBounds(), {
      padding: [50, 50]
    });
    
    // Utiliser OSRM pour obtenir un itinéraire qui suit les routes
    this.getRouteFollowingRoads(latlngs).then(routeCoordinates => {
      // Supprimer le tracé temporaire
      this.currentMap.removeLayer(tempPolyline);
      
      // Créer un nouveau tracé qui suit les routes
      this.polyline = L.polyline(routeCoordinates, {
        color: '#FF0000',
        weight: 4,
        opacity: 1.0
      }).addTo(this.currentMap);
      
      // Calculer la distance totale du tracé
      const distance = this.calculateRouteDistance(routeCoordinates);
      
      // Déclencher un événement personnalisé pour informer React
      const event = new CustomEvent('routeUpdated', {
        detail: {
          distance,
          path: latlngs.map(p => ({ lat: p.lat, lng: p.lng }))
        }
      });
      document.dispatchEvent(event);
    }).catch(error => {
      console.error("Erreur lors de la récupération de l'itinéraire:", error);
      
      // En cas d'erreur, utiliser le tracé en ligne droite
      this.polyline = tempPolyline;
      
      // Calculer la distance totale du tracé en ligne droite
      const distance = this.calculateDistance();
      
      // Déclencher un événement personnalisé pour informer React
      const event = new CustomEvent('routeUpdated', {
        detail: {
          distance,
          path: latlngs.map(p => ({ lat: p.lat, lng: p.lng }))
        }
      });
      document.dispatchEvent(event);
    });
  },
  
  // Obtenir un itinéraire qui suit les routes entre les points
  getRouteFollowingRoads: async function(waypoints) {
    if (waypoints.length < 2) {
      return waypoints;
    }
    
    try {
      // Créer des segments de route entre chaque paire de points consécutifs
      let allRouteCoordinates = [];
      
      for (let i = 0; i < waypoints.length - 1; i++) {
        const start = waypoints[i];
        const end = waypoints[i + 1];
        
        // Construire l'URL pour l'API OSRM
        const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
        
        // Faire la requête à l'API
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          // Extraire les coordonnées de l'itinéraire
          const routeCoordinates = data.routes[0].geometry.coordinates.map(coord => [
            coord[1], coord[0] // Inverser lat/lng car OSRM renvoie [lng, lat]
          ]);
          
          // Ajouter les coordonnées à l'ensemble des coordonnées de l'itinéraire
          if (i === 0) {
            // Pour le premier segment, ajouter toutes les coordonnées
            allRouteCoordinates = allRouteCoordinates.concat(routeCoordinates);
          } else {
            // Pour les segments suivants, ne pas ajouter le premier point (déjà inclus)
            allRouteCoordinates = allRouteCoordinates.concat(routeCoordinates.slice(1));
          }
        } else {
          // En cas d'erreur, utiliser une ligne droite pour ce segment
          allRouteCoordinates.push([start.lat, start.lng]);
          allRouteCoordinates.push([end.lat, end.lng]);
        }
      }
      
      return allRouteCoordinates;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'itinéraire:", error);
      return waypoints; // En cas d'erreur, retourner les points d'origine
    }
  },
  
  // Calculer la distance totale d'un itinéraire
  calculateRouteDistance: function(routeCoordinates) {
    if (!routeCoordinates || routeCoordinates.length < 2) {
      return 0;
    }
    
    let totalDistance = 0;
    
    for (let i = 0; i < routeCoordinates.length - 1; i++) {
      const p1 = L.latLng(routeCoordinates[i][0], routeCoordinates[i][1]);
      const p2 = L.latLng(routeCoordinates[i + 1][0], routeCoordinates[i + 1][1]);
      
      // Calculer la distance entre deux points avec Leaflet
      totalDistance += p1.distanceTo(p2);
    }
    
    // Convertir de mètres en kilomètres et arrondir à 2 décimales
    return Math.round((totalDistance / 1000) * 100) / 100;
  },
  
  // Calculer la distance totale du tracé en kilomètres
  calculateDistance: function() {
    if (this.markers.length < 2) {
      return 0;
    }
    
    let totalDistance = 0;
    
    for (let i = 0; i < this.markers.length - 1; i++) {
      const p1 = this.markers[i].getLatLng();
      const p2 = this.markers[i + 1].getLatLng();
      
      // Calculer la distance entre deux points avec Leaflet
      totalDistance += p1.distanceTo(p2);
    }
    
    // Convertir de mètres en kilomètres et arrondir à 2 décimales
    return Math.round((totalDistance / 1000) * 100) / 100;
  },
  
  // Calculer le dénivelé (simulation - OpenStreetMap n'a pas d'API d'élévation intégrée)
  calculateElevation: function(callback) {
    // Simuler un dénivelé pour la démonstration
    // Dans une application réelle, on pourrait utiliser une API d'élévation tierce
    setTimeout(() => {
      const simulatedElevation = Math.floor(Math.random() * 2000) + 500;
      callback(simulatedElevation);
    }, 500);
  },
  
  // Effacer tous les marqueurs et le tracé
  clearRoute: function() {
    // Supprimer tous les marqueurs
    this.markers.forEach(marker => {
      this.currentMap.removeLayer(marker);
    });
    
    // Vider le tableau de marqueurs
    this.markers = [];
    
    // Supprimer le tracé
    if (this.polyline) {
      this.currentMap.removeLayer(this.polyline);
      this.polyline = null;
    }
    
    // Déclencher un événement pour informer React
    const event = new CustomEvent('routeUpdated', {
      detail: {
        distance: 0,
        path: []
      }
    });
    document.dispatchEvent(event);
  },
  
  // Rechercher un lieu par nom (utilise Nominatim d'OpenStreetMap)
  searchPlace: function(query, callback) {
    if (!this.currentMap) {
      console.error('Map not initialized');
      return;
    }
    
    // Utiliser l'API Nominatim d'OpenStreetMap pour la géocodage
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          
          // Centrer la carte sur le lieu trouvé
          this.currentMap.setView([lat, lng], 13);
          
          if (callback) {
            callback({
              lat: lat,
              lng: lng,
              name: result.display_name
            });
          }
        } else {
          console.error('Geocode failed: No results');
          if (callback) {
            callback(null);
          }
        }
      })
      .catch(error => {
        console.error('Geocode error:', error);
        if (callback) {
          callback(null);
        }
      });
  },
  
  // Exporter le tracé au format GeoJSON
  exportRoute: function() {
    if (!this.markers.length) {
      return null;
    }
    
    const coordinates = this.markers.map(marker => {
      const position = marker.getLatLng();
      return [position.lng, position.lat];
    });
    
    return {
      type: 'Feature',
      properties: {
        name: 'Route',
        distance: this.calculateDistance()
      },
      geometry: {
        type: 'LineString',
        coordinates
      }
    };
  },
  
  // Importer un tracé à partir d'un GeoJSON
  importRoute: function(geoJson) {
    if (!this.currentMap) {
      console.error('Map not initialized');
      return;
    }
    
    this.clearRoute();
    
    if (!geoJson || !geoJson.geometry || !geoJson.geometry.coordinates) {
      return false;
    }
    
    const coordinates = geoJson.geometry.coordinates;
    
    if (coordinates.length < 2) {
      return false;
    }
    
    // Ajouter un marqueur de départ
    this.addStartMarker([
      coordinates[0][1],
      coordinates[0][0]
    ]);
    
    // Ajouter des points intermédiaires
    for (let i = 1; i < coordinates.length - 1; i++) {
      this.addWaypointMarker([
        coordinates[i][1],
        coordinates[i][0]
      ]);
    }
    
    // Ajouter un marqueur d'arrivée
    this.addEndMarker([
      coordinates[coordinates.length - 1][1],
      coordinates[coordinates.length - 1][0]
    ]);
    
    // Ajuster la vue pour voir tout le tracé
    if (this.polyline) {
      this.currentMap.fitBounds(this.polyline.getBounds());
    }
    
    return true;
  },
  
  // Fonction de diagnostic et réparation mobile
  fixMobileMap: function() {
    if (!this.currentMap) {
      console.warn('⚠️ Aucune carte à réparer');
      return;
    }
    
    console.log('🔧 Réparation carte mobile...');
    
    // Forcer le redimensionnement
    this.currentMap.invalidateSize();
    
    // Recharger les tuiles
    this.currentMap.eachLayer(layer => {
      if (layer._url) { // C'est une couche de tuiles
        layer.redraw();
      }
    });
    
    console.log('✅ Carte mobile réparée');
  }
};

// Initialiser la carte
window.initMap = initMap;

// Nous n'avons plus besoin des styles personnalisés car nous utilisons des icônes prédéfinies
