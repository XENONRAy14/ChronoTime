/**
 * SOLUTION MOBILE MAP - APPROCHE SIMPLE ET EFFICACE
 * Cette solution garantit l'affichage des tuiles sur mobile sans complexité inutile
 */
(function() {
  'use strict';
  
  // Attendre que la carte soit créée
  function waitForMap() {
    // Vérifier si la carte est disponible
    if (!window.MapFunctions || !window.MapFunctions.currentMap) {
      setTimeout(waitForMap, 500);
      return;
    }
    
    const map = window.MapFunctions.currentMap;
    console.log('🗺️ Carte détectée, application fix mobile...');
    
    // 1. Solution CSS - injecter des styles critiques
    const styleId = 'mobile-map-fix-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* Force l'affichage des tuiles */
        .leaflet-tile-container, .leaflet-tile {
          position: absolute !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          width: auto !important;
          height: auto !important;
        }
        
        /* Force l'affichage des conteneurs */
        .leaflet-container, .leaflet-pane {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        /* Correction fond */
        .leaflet-container {
          background-color: #f2f2f2 !important;
        }
      `;
      document.head.appendChild(style);
      console.log('✅ Styles critiques injectés');
    }
    
    // 2. Solution JavaScript - forcer le rafraîchissement des tuiles
    function fixTiles() {
      // Forcer redimensionnement
      map.invalidateSize(true);
      
      // Recharger les tuiles
      map.eachLayer(function(layer) {
        if (layer._url) {
          layer.redraw();
        }
      });
      
      // Force repaint
      const center = map.getCenter();
      const zoom = map.getZoom();
      map.setView(center, zoom, { animate: false });
      
      console.log('✅ Tuiles rafraîchies');
    }
    
    // Appliquer la solution immédiatement et avec délai
    fixTiles();
    setTimeout(fixTiles, 1000);
    setTimeout(fixTiles, 3000);
    
    // Aussi après changement d'onglet (détection par changements de hash)
    let lastHash = window.location.hash;
    setInterval(function() {
      const currentHash = window.location.hash;
      if (currentHash !== lastHash) {
        lastHash = currentHash;
        setTimeout(fixTiles, 500);
      }
    }, 200);
    
    // Aussi après resize et orientation change
    window.addEventListener('resize', function() {
      setTimeout(fixTiles, 500);
    });
    
    window.addEventListener('orientationchange', function() {
      setTimeout(fixTiles, 500);
    });
    
    console.log('✅ Solution carte mobile activée');
  }
  
  // Démarrer dès que possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForMap);
  } else {
    waitForMap();
  }
})();
