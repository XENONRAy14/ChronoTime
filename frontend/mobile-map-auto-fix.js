// AUTO-FIX CARTE MOBILE - Solution optimisée
(function() {
    'use strict';
    
    // Détecter mobile uniquement
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return;
    }
    
    console.log('📱 Fix carte mobile activé');
    
    // Fix complet de la carte mobile
    function fixMobileMap() {
        if (!window.MapFunctions || !window.MapFunctions.currentMap) {
            setTimeout(fixMobileMap, 200);
            return;
        }
        
        const map = window.MapFunctions.currentMap;
        
        // 1. Forcer redimensionnement
        map.invalidateSize(true);
        
        // 2. Recharger tuiles
        map.eachLayer(layer => {
            if (layer._url && layer.redraw) {
                layer.redraw();
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
