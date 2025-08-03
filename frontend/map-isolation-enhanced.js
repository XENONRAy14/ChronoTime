// DÉSACTIVÉ - REMPLACÉ PAR map-mobile-unified.js
// MAP ISOLATION ENHANCED - VERSION AMÉLIORÉE
(function() {
    'use strict';
    
    console.log('⚠️ map-isolation-enhanced.js désactivé - utiliser map-mobile-unified.js');
    return; // SCRIPT DÉSACTIVÉ
    
    console.log('🛡️ Initialisation du mode isolation carte RENFORCÉ...');
    
    // Attendre que le DOM soit chargé
    document.addEventListener('DOMContentLoaded', function() {
        // Attendre que Leaflet soit chargé
        const checkLeaflet = setInterval(() => {
            if (window.L) {
                clearInterval(checkLeaflet);
                enhanceMapIsolation();
            }
        }, 100);
    });
    
    function enhanceMapIsolation() {
        // Attendre que les cartes Leaflet soient créées
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.classList && node.classList.contains('leaflet-container')) {
                            applyMapProtection(node);
                        }
                    });
                }
            });
        });
        
        // Observer tout le document pour détecter les nouvelles cartes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Appliquer aux cartes existantes
        document.querySelectorAll('.leaflet-container').forEach(applyMapProtection);
    }
    
    function applyMapProtection(mapElement) {
        if (mapElement.dataset.protected) return;
        mapElement.dataset.protected = "true";
        
        // 1. Créer un conteneur de protection autour de la carte
        const mapParent = mapElement.parentElement;
        const protectionWrapper = document.createElement('div');
        protectionWrapper.className = 'map-protection-wrapper';
        protectionWrapper.style.cssText = `
            position: relative;
            overflow: hidden;
            width: 100%;
            height: 100%;
            touch-action: none;
        `;
        
        // Remplacer la carte par le wrapper et mettre la carte dans le wrapper
        mapParent.insertBefore(protectionWrapper, mapElement);
        protectionWrapper.appendChild(mapElement);
        
        // 2. Ajouter un overlay transparent qui capture les événements
        const eventCaptureOverlay = document.createElement('div');
        eventCaptureOverlay.className = 'map-event-capture';
        eventCaptureOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
            background: transparent;
            touch-action: none;
            pointer-events: none;
        `;
        protectionWrapper.appendChild(eventCaptureOverlay);
        
        // 3. Ajouter un bouton d'aide
        const helpButton = document.createElement('button');
        helpButton.className = 'map-help-button';
        helpButton.textContent = '?';
        helpButton.style.cssText = `
            position: absolute;
            bottom: 10px;
            right: 10px;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: rgba(0,0,0,0.7);
            color: white;
            border: none;
            font-weight: bold;
            z-index: 1001;
            cursor: pointer;
        `;
        protectionWrapper.appendChild(helpButton);
        
        // 4. Ajouter un message d'aide
        const helpMessage = document.createElement('div');
        helpMessage.className = 'map-help-message';
        helpMessage.innerHTML = '<strong>Astuce:</strong> Utilisez deux doigts pour déplacer la carte et pincer pour zoomer.';
        helpMessage.style.cssText = `
            position: absolute;
            bottom: 50px;
            right: 10px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            max-width: 200px;
            z-index: 1001;
            display: none;
        `;
        protectionWrapper.appendChild(helpMessage);
        
        // 5. Montrer/cacher le message d'aide
        helpButton.addEventListener('click', () => {
            if (helpMessage.style.display === 'none') {
                helpMessage.style.display = 'block';
                setTimeout(() => {
                    helpMessage.style.display = 'none';
                }, 5000);
            } else {
                helpMessage.style.display = 'none';
            }
        });
        
        // 6. Empêcher le changement d'onglet lors du défilement sur la carte
        mapElement.addEventListener('touchstart', (e) => {
            if (e.touches.length >= 2) {
                e.stopPropagation();
            }
        }, { passive: false });
        
        mapElement.addEventListener('touchmove', (e) => {
            if (e.touches.length >= 1) {
                e.stopPropagation();
            }
        }, { passive: false });
        
        mapElement.addEventListener('wheel', (e) => {
            e.stopPropagation();
        }, { passive: false });
        
        // 7. Empêcher les clics sur les onglets pendant l'interaction avec la carte
        let lastTouchTime = 0;
        mapElement.addEventListener('touchend', () => {
            lastTouchTime = Date.now();
        });
        
        document.addEventListener('click', (e) => {
            if (Date.now() - lastTouchTime < 300) {
                if (e.target.classList.contains('tab')) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }, true);
        
        console.log('🔒 Protection renforcée appliquée à la carte', mapElement);
    }
})();
