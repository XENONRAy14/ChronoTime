// AUTO-FIX CARTE MOBILE - Solution propre et légère
(function() {
    'use strict';
    
    // Détecter mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.innerWidth <= 768;
    
    if (!isMobile) return;
    
    console.log('📱 Auto-fix carte mobile activé');
    
    // Attendre que MapFunctions soit disponible
    function waitAndFix() {
        if (window.MapFunctions && window.MapFunctions.currentMap) {
            // Appliquer le fix après un court délai
            setTimeout(() => {
                window.MapFunctions.fixMobileMap();
            }, 500);
        } else {
            // Réessayer dans 500ms
            setTimeout(waitAndFix, 500);
        }
    }
    
    // Démarrer le processus quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitAndFix);
    } else {
        waitAndFix();
    }
    
    // Fix supplémentaire lors du redimensionnement
    window.addEventListener('resize', () => {
        if (window.MapFunctions && window.MapFunctions.currentMap) {
            setTimeout(() => {
                window.MapFunctions.fixMobileMap();
            }, 100);
        }
    });
    
})();
