// AUTO-FIX CARTE GARANTIE - Solution de secours agressive
(function() {
    'use strict';
    
    console.log('🛠️ Fix carte agressive activé');
    
    // 1. Styles critiques pour force affichage
    const criticalCSS = `
    /* SUPER CRITICAL TUILES CSS */
    .leaflet-tile-container *, .leaflet-tile-pane * {
      opacity: 1 !important;
      display: block !important;
      visibility: visible !important;
      transform-origin: center center !important;
    }
    .leaflet-container {
      background-color: #f2f2f2 !important;
    }
    `;
    
    // Injecter CSS haut-priorité 
    const styleEl = document.createElement('style');
    styleEl.id = 'fix-map-critical';
    styleEl.innerHTML = criticalCSS;
    document.head.appendChild(styleEl);
    
    // 2. Fix agressif pour garantir l'affichage
    function guaranteeMap() {
        if (!window.MapFunctions || !window.MapFunctions.currentMap) {
            setTimeout(guaranteeMap, 200);
            return;
        }
        
        const map = window.MapFunctions.currentMap;
        
        // Forcer redimensionnement et rafraîchissement multiple
        function forceRefresh() {
            // 1. Forcer redimensionnement
            map.invalidateSize({pan: false, animate: false, debounceMoveend: false});
            
            // 2. Rafraîchissement violent des tuiles
            map.eachLayer(function(layer) {
                if (layer._url) {
                    // Force redraw
                    layer.redraw();
                    
                    // Force tile reload avec paramètre unique
                    if (layer._tiles) {
                        Object.keys(layer._tiles).forEach(key => {
                            const tile = layer._tiles[key];
                            if (tile && tile.el && tile.el.src) {
                                // Nouvelle URL pour contourner cache
                                const timestamp = Date.now() + Math.random().toString(36);
                                tile.el.src = tile.el.src.split('?')[0] + '?t=' + timestamp;
                                
                                // Force visibilité
                                tile.el.style.opacity = '1';
                                tile.el.style.visibility = 'visible';
                                tile.el.style.display = 'block';
                            }
                        });
                    }
                    
                    // 3. Recréer les tuiles manquantes
                    layer._update();
                }
            });
            
            // 4. Forces les calculs de positionnement
            const currentCenter = map.getCenter();
            const currentZoom = map.getZoom();
            map.setView(currentCenter, currentZoom, {reset: true, pan: false, animate: false});
            
            console.log('💥 Refresh brutal tuiles appliqué');
        }
        
        // CYCLE MULTIPLE DE REFRESH
        forceRefresh();
        setTimeout(forceRefresh, 800);
        setTimeout(forceRefresh, 1500);
        setTimeout(forceRefresh, 3000);
        
        // Refresh aussi au redimensionnement
        window.addEventListener('resize', function() {
            setTimeout(forceRefresh, 200);
        });
    }
    
    // Démarrer le fix
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(guaranteeMap, 1000));
    } else {
        setTimeout(guaranteeMap, 1000);
    }
})();
