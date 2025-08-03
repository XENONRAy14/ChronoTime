// DÉSACTIVÉ - REMPLACÉ PAR map-mobile-unified.js
// OPTIMISATIONS CARTE MOBILE - GESTES INTUITIFS
(function() {
    'use strict';
    
    console.log('⚠️ map-mobile-fix.js désactivé - utiliser map-mobile-unified.js');
    return; // SCRIPT DÉSACTIVÉ
    
    let mapContainer = null;
    let isMapInteracting = false;
    
    document.addEventListener('DOMContentLoaded', function() {
        initMapMobileFixes();
    });
    
    function initMapMobileFixes() {
        console.log('🗺️ Initialisation des corrections carte mobile...');
        
        // Attendre que Leaflet soit chargé
        if (typeof L === 'undefined') {
            setTimeout(initMapMobileFixes, 100);
            return;
        }
        
        // Observer la création des cartes
        observeMapCreation();
        
        // Corrections globales pour les gestes tactiles
        setupGlobalTouchFixes();
    }
    
    function observeMapCreation() {
        // Observer les changements DOM pour détecter les nouvelles cartes
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Chercher les conteneurs de carte
                        const mapContainers = node.querySelectorAll ? 
                            node.querySelectorAll('.leaflet-container') : [];
                        
                        if (node.classList && node.classList.contains('leaflet-container')) {
                            optimizeMapForMobile(node);
                        }
                        
                        mapContainers.forEach(optimizeMapForMobile);
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Optimiser les cartes existantes
        document.querySelectorAll('.leaflet-container').forEach(optimizeMapForMobile);
    }
    
    function optimizeMapForMobile(mapElement) {
        if (window.innerWidth > 768) return; // Seulement sur mobile
        
        console.log('🔧 Optimisation carte mobile détectée');
        
        // Récupérer l'instance Leaflet
        const map = mapElement._leaflet_map;
        if (!map) {
            console.warn('Instance Leaflet non trouvée');
            return;
        }
        
        // Désactiver les interactions problématiques
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        
        // Garder seulement le drag et les boutons de zoom
        map.dragging.enable();
        
        // Améliorer les contrôles de zoom
        if (map.zoomControl) {
            map.zoomControl.remove();
        }
        
        // Ajouter des contrôles de zoom personnalisés plus grands
        const customZoomControl = L.control.zoom({
            position: 'topright'
        });
        customZoomControl.addTo(map);
        
        // Styliser les boutons de zoom
        setTimeout(() => {
            const zoomButtons = mapElement.querySelectorAll('.leaflet-control-zoom a');
            zoomButtons.forEach(btn => {
                btn.style.cssText = `
                    width: 40px !important;
                    height: 40px !important;
                    line-height: 40px !important;
                    font-size: 20px !important;
                    background: rgba(0, 0, 0, 0.9) !important;
                    color: #ff0000 !important;
                    border: 1px solid #ff0000 !important;
                    border-radius: 4px !important;
                    margin: 2px !important;
                    touch-action: manipulation !important;
                `;
            });
        }, 100);
        
        // Prévenir les conflits avec les onglets
        setupMapTouchHandling(mapElement);
        
        // Ajouter un indicateur visuel
        addMapInstructions(mapElement);
    }
    
    function setupMapTouchHandling(mapElement) {
        let touchStartTime = 0;
        let touchStartPos = { x: 0, y: 0 };
        
        mapElement.addEventListener('touchstart', function(e) {
            isMapInteracting = true;
            touchStartTime = Date.now();
            
            if (e.touches.length > 0) {
                touchStartPos.x = e.touches[0].clientX;
                touchStartPos.y = e.touches[0].clientY;
            }
            
            // Empêcher la propagation vers les onglets
            e.stopPropagation();
            
            // Ajouter une classe pour indiquer l'interaction
            document.body.classList.add('map-interacting');
        }, { passive: false });
        
        mapElement.addEventListener('touchmove', function(e) {
            if (isMapInteracting) {
                // Empêcher le scroll de la page
                e.preventDefault();
                e.stopPropagation();
            }
        }, { passive: false });
        
        mapElement.addEventListener('touchend', function(e) {
            const touchDuration = Date.now() - touchStartTime;
            
            // Si c'est un tap rapide, ne pas changer d'onglet
            if (touchDuration < 200) {
                e.stopPropagation();
            }
            
            setTimeout(() => {
                isMapInteracting = false;
                document.body.classList.remove('map-interacting');
            }, 100);
        }, { passive: false });
        
        // Empêcher les clics accidentels sur les onglets pendant l'interaction carte
        document.addEventListener('click', function(e) {
            if (isMapInteracting && e.target.classList.contains('tab')) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚫 Clic onglet bloqué pendant interaction carte');
            }
        }, true);
    }
    
    function addMapInstructions(mapElement) {
        // Ajouter un overlay d'instructions
        const instructions = document.createElement('div');
        instructions.className = 'map-instructions';
        instructions.innerHTML = `
            <div style="
                position: absolute;
                top: 10px;
                left: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: #ff0000;
                padding: 5px 8px;
                border-radius: 4px;
                font-size: 0.7rem;
                z-index: 1000;
                pointer-events: none;
                opacity: 0.9;
                border: 1px solid #ff0000;
            ">
                📍 Glissez pour déplacer<br>
                🔍 Utilisez +/- pour zoomer
            </div>
        `;
        
        mapElement.style.position = 'relative';
        mapElement.appendChild(instructions);
        
        // Masquer les instructions après 3 secondes
        setTimeout(() => {
            if (instructions.parentNode) {
                instructions.style.opacity = '0';
                instructions.style.transition = 'opacity 1s ease';
                setTimeout(() => {
                    if (instructions.parentNode) {
                        instructions.parentNode.removeChild(instructions);
                    }
                }, 1000);
            }
        }, 3000);
    }
    
    function setupGlobalTouchFixes() {
        // Empêcher le zoom accidentel du navigateur sur la carte
        document.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1 && e.target.closest('.leaflet-container')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('touchmove', function(e) {
            if (e.touches.length > 1 && e.target.closest('.leaflet-container')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Améliorer la réactivité des boutons de zoom
        document.addEventListener('click', function(e) {
            if (e.target.closest('.leaflet-control-zoom')) {
                e.stopPropagation();
                // Feedback visuel
                e.target.style.background = 'rgba(255, 0, 0, 0.3)';
                setTimeout(() => {
                    e.target.style.background = '';
                }, 150);
            }
        });
    }
    
    // Exposer pour debug
    window.MapMobileFix = {
        optimize: optimizeMapForMobile,
        isInteracting: () => isMapInteracting
    };
    
})();
