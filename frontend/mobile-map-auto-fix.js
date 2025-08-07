// AUTO-FIX CARTE UNIVERSELLE - Solution optimisée
(function() {
    'use strict';
    
    console.log('🗺️ Fix carte universelle activé');
    
    // Fix complet de la carte mobile
    function fixMobileMap() {
        if (!window.MapFunctions || !window.MapFunctions.currentMap) {
            setTimeout(fixMobileMap, 200);
            return;
        }
        
        const map = window.MapFunctions.currentMap;
        
        // 1. Forcer redimensionnement
        map.invalidateSize(true);
        
        // 2. Forcer rechargement tuiles
        map.eachLayer(layer => {
            if (layer._url) {
                // Forcer le rechargement complet
                layer.redraw();
                // Vider le cache des tuiles
                if (layer._tiles) {
                    Object.keys(layer._tiles).forEach(key => {
                        const tile = layer._tiles[key];
                        if (tile.el && tile.el.src) {
                            tile.el.src = tile.el.src + '?t=' + Date.now();
                        }
                    });
                }
                console.log('🔄 Tuiles rechargées avec cache vidé');
            }
        });
        
        // 3. Forcer repositionnement
        const center = map.getCenter();
        const zoom = map.getZoom();
        map.setView(center, zoom, { animate: false });
        
        console.log('✅ Carte mobile réparée');
    }
    
    // Démarrer le fix
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(fixMobileMap, 1000));
    } else {
        setTimeout(fixMobileMap, 1000);
    }
    
})();
