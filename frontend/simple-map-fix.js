// SOLUTION ULTRA-SIMPLE - JUSTE BLOQUER ONGLETS PENDANT TOUCH CARTE
(function() {
    'use strict';
    
    let isMapInteracting = false;
    
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🗺️ Solution ultra-simple carte mobile...');
        
        // Détecter touch sur carte - ULTRA SIMPLE
        document.addEventListener('touchstart', function(e) {
            if (e.target.closest('.leaflet-container')) {
                isMapInteracting = true;
            }
        }, { passive: true });
        
        document.addEventListener('touchend', function(e) {
            setTimeout(() => {
                isMapInteracting = false;
            }, 300); // Court délai
        }, { passive: true });
        
        // Bloquer SEULEMENT les clics onglets
        document.addEventListener('click', function(e) {
            if (isMapInteracting && e.target.closest('.tab, .nav-tab')) {
                e.preventDefault();
                e.stopPropagation();
                console.log('😫 Onglet bloqué');
                return false;
            }
        }, true);
    });
    
    // API minimale
    window.SimpleMapFix = {
        isInteracting: () => isMapInteracting
    };
    
})();
