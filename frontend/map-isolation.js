// DÉSACTIVÉ - REMPLACÉ PAR map-mobile-unified.js
// MAP ISOLATION MODE - SOLUTION RADICALE POUR MOBILE
(function() {
    'use strict';
    
    console.log('⚠️ map-isolation.js désactivé - utiliser map-mobile-unified.js');
    return; // SCRIPT DÉSACTIVÉ
    
    // État global
    let isMapIsolationActive = false;
    let mapInteractionTimeout;
    let originalBodyOverflow;
    let isolationOverlay;
    let activeMap = null;
    
    document.addEventListener('DOMContentLoaded', function() {
        initMapIsolation();
    });
    
    function initMapIsolation() {
        console.log('🔒 Initialisation du mode isolation carte...');
        
        // Attendre que Leaflet soit chargé
        if (typeof L === 'undefined') {
            setTimeout(initMapIsolation, 100);
            return;
        }
        
        // Créer l'overlay d'isolation une seule fois
        createIsolationOverlay();
        
        // Observer la création des cartes
        observeMapCreation();
    }
    
    function createIsolationOverlay() {
        // Créer l'overlay d'isolation qui bloque toutes les autres interactions
        isolationOverlay = document.createElement('div');
        isolationOverlay.className = 'map-isolation-overlay';
        isolationOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 9990;
            display: none;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            backdrop-filter: blur(2px);
        `;
        
        // Ajouter le bouton pour quitter le mode isolation
        const exitButton = document.createElement('button');
        exitButton.className = 'exit-isolation-button';
        exitButton.style.cssText = `
            position: fixed;
            top: 15px;
            right: 15px;
            background: var(--primary-color, #ff0000);
            color: black;
            border: none;
            border-radius: 50%;
            width: 44px;
            height: 44px;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            z-index: 9999;
        `;
        exitButton.innerHTML = '✕';
        exitButton.title = 'Quitter le mode carte';
        exitButton.addEventListener('click', exitMapIsolationMode);
        
        // Ajouter une instruction
        const instructions = document.createElement('div');
        instructions.className = 'map-isolation-instructions';
        instructions.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 0.8rem;
            text-align: center;
            pointer-events: none;
            z-index: 9999;
            border: 1px solid var(--primary-color, #ff0000);
        `;
        instructions.textContent = 'Mode carte activé - Navigation bloquée';
        
        // Ajouter à l'overlay
        isolationOverlay.appendChild(exitButton);
        isolationOverlay.appendChild(instructions);
        document.body.appendChild(isolationOverlay);
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
                            setupMapIsolation(node);
                        }
                        
                        mapContainers.forEach(setupMapIsolation);
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Configurer les cartes existantes
        document.querySelectorAll('.leaflet-container').forEach(setupMapIsolation);
    }
    
    function setupMapIsolation(mapElement) {
        if (!mapElement || window.innerWidth > 768) return; // Seulement sur mobile
        
        console.log('🔒 Configuration isolation carte');
        
        // Ajouter un conteneur parent pour le positionnement si nécessaire
        if (!mapElement.parentElement.classList.contains('map-isolation-container')) {
            const container = document.createElement('div');
            container.className = 'map-isolation-container';
            container.style.position = 'relative';
            mapElement.parentNode.insertBefore(container, mapElement);
            container.appendChild(mapElement);
        }
        
        // Ajouter un bouton d'activation du mode isolation
        const activateButton = document.createElement('button');
        activateButton.className = 'activate-map-isolation';
        activateButton.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: var(--primary-color, #ff0000);
            border: 1px solid var(--primary-color, #ff0000);
            border-radius: 4px;
            padding: 5px 8px;
            font-size: 0.7rem;
            z-index: 1000;
            cursor: pointer;
        `;
        activateButton.textContent = '🔍 Mode carte';
        activateButton.title = 'Activer le mode carte plein écran';
        activateButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            enterMapIsolationMode(mapElement);
        });
        
        // Ajouter le bouton à la carte si pas déjà présent
        if (!mapElement.querySelector('.activate-map-isolation')) {
            mapElement.appendChild(activateButton);
        }
        
        // Gestionnaires d'événements tactiles pour la détection automatique
        setupMapTouchDetection(mapElement);
    }
    
    function setupMapTouchDetection(mapElement) {
        // Variables pour la détection des gestes
        let touchStartTime = 0;
        let touchStartPos = { x: 0, y: 0 };
        let touchMoved = false;
        let longPressTimer;
        
        // Détecter le début du toucher
        mapElement.addEventListener('touchstart', function(e) {
            touchStartTime = Date.now();
            touchMoved = false;
            
            if (e.touches.length > 0) {
                touchStartPos.x = e.touches[0].clientX;
                touchStartPos.y = e.touches[0].clientY;
            }
            
            // Détecter l'appui long pour activer le mode isolation
            longPressTimer = setTimeout(function() {
                if (!touchMoved && !isMapIsolationActive) {
                    enterMapIsolationMode(mapElement);
                    vibrate(100); // Feedback tactile
                }
            }, 500);
            
            // Si on est déjà en mode isolation, bloquer la propagation des événements
            if (isMapIsolationActive) {
                e.stopPropagation();
            }
        }, { passive: false });
        
        // Détecter le mouvement
        mapElement.addEventListener('touchmove', function(e) {
            if (Math.abs(e.touches[0].clientX - touchStartPos.x) > 5 || 
                Math.abs(e.touches[0].clientY - touchStartPos.y) > 5) {
                touchMoved = true;
                clearTimeout(longPressTimer);
            }
            
            // Pendant l'interaction avec la carte, empêcher le scroll de la page
            if (touchMoved && !isMapIsolationActive) {
                const map = mapElement._leaflet_map;
                if (map && e.touches.length === 1) {
                    const isVerticalSwipe = Math.abs(e.touches[0].clientY - touchStartPos.y) > 
                                           Math.abs(e.touches[0].clientX - touchStartPos.x);
                    
                    // Si c'est un swipe vertical significatif, suggérer le mode isolation
                    if (isVerticalSwipe && Math.abs(e.touches[0].clientY - touchStartPos.y) > 30) {
                        showMapIsolationHint(mapElement);
                    }
                }
            }
            
            // Bloquer la propagation en mode isolation
            if (isMapIsolationActive) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, { passive: false });
        
        // Fin du toucher
        mapElement.addEventListener('touchend', function(e) {
            clearTimeout(longPressTimer);
            
            // Empêcher les clics accidentels sur les onglets
            const touchDuration = Date.now() - touchStartTime;
            if (touchDuration < 300 && !touchMoved) {
                e.stopPropagation();
            }
            
            // Bloquer la propagation en mode isolation
            if (isMapIsolationActive) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, { passive: false });
    }
    
    function showMapIsolationHint(mapElement) {
        // Ne pas afficher l'indice si déjà en mode isolation ou si l'indice est déjà visible
        if (isMapIsolationActive || document.querySelector('.map-isolation-hint')) return;
        
        const hint = document.createElement('div');
        hint.className = 'map-isolation-hint';
        hint.style.cssText = `
            position: absolute;
            bottom: 50%;
            left: 50%;
            transform: translate(-50%, 50%);
            background: rgba(0, 0, 0, 0.9);
            color: var(--primary-color, #ff0000);
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 0.8rem;
            text-align: center;
            z-index: 1001;
            animation: pulseHint 1s infinite alternate;
            pointer-events: none;
            border: 1px solid var(--primary-color, #ff0000);
        `;
        hint.textContent = 'Appuyez longuement pour le mode carte plein écran';
        
        // Ajouter le style d'animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulseHint {
                0% { opacity: 0.7; transform: translate(-50%, 50%) scale(0.95); }
                100% { opacity: 1; transform: translate(-50%, 50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        // Ajouter l'indice à la carte
        mapElement.appendChild(hint);
        
        // Supprimer l'indice après 2 secondes
        setTimeout(function() {
            if (hint.parentNode) {
                hint.parentNode.removeChild(hint);
            }
        }, 2000);
    }
    
    function enterMapIsolationMode(mapElement) {
        if (!mapElement || isMapIsolationActive) return;
        
        console.log('🔒 Activation mode isolation carte');
        
        // Sauvegarder la carte active
        activeMap = mapElement;
        
        // Empêcher le scroll du body
        originalBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        
        // Ajouter la classe à la carte
        mapElement.classList.add('map-isolated');
        
        // Position originale de la carte pour l'animation
        const mapRect = mapElement.getBoundingClientRect();
        const originalPos = {
            top: mapRect.top + 'px',
            left: mapRect.left + 'px',
            width: mapRect.width + 'px',
            height: mapRect.height + 'px'
        };
        
        // Créer un clone de la carte pour l'animation
        const mapClone = mapElement.cloneNode(true);
        mapClone.id = 'map-clone';
        mapClone.style.cssText = `
            position: fixed;
            top: ${originalPos.top};
            left: ${originalPos.left};
            width: ${originalPos.width};
            height: ${originalPos.height};
            z-index: 9995;
            transition: all 0.3s ease;
            pointer-events: none;
        `;
        
        // Cacher la carte originale
        mapElement.style.visibility = 'hidden';
        
        // Ajouter le clone au document
        document.body.appendChild(mapClone);
        
        // Afficher l'overlay
        isolationOverlay.style.display = 'flex';
        setTimeout(() => {
            isolationOverlay.style.opacity = '1';
        }, 10);
        
        // Animer le clone vers le centre plein écran
        setTimeout(() => {
            mapClone.style.top = '50%';
            mapClone.style.left = '50%';
            mapClone.style.width = '90%';
            mapClone.style.height = '80%';
            mapClone.style.transform = 'translate(-50%, -50%)';
            mapClone.style.borderRadius = '10px';
            mapClone.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
            mapClone.style.border = '2px solid var(--primary-color, #ff0000)';
        }, 50);
        
        // À la fin de l'animation, replacer la vraie carte
        setTimeout(() => {
            // Positionner la vraie carte comme le clone
            mapElement.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                width: 90%;
                height: 80%;
                transform: translate(-50%, -50%);
                z-index: 9998;
                visibility: visible;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
                border: 2px solid var(--primary-color, #ff0000);
            `;
            
            // Supprimer le clone
            document.body.removeChild(mapClone);
            
            // Marquer comme actif
            isMapIsolationActive = true;
            
            // Réinitialiser la carte Leaflet pour s'adapter à sa nouvelle taille
            const map = mapElement._leaflet_map;
            if (map) {
                setTimeout(() => map.invalidateSize(), 100);
            }
            
            // Vibrer pour feedback tactile
            vibrate(50);
        }, 350);
        
        // Désactiver tous les autres éléments interactifs
        document.querySelectorAll('.tab, a:not(.leaflet-control a), button:not(.exit-isolation-button)').forEach(el => {
            el.style.pointerEvents = 'none';
        });
    }
    
    function exitMapIsolationMode() {
        if (!isMapIsolationActive || !activeMap) return;
        
        console.log('🔓 Désactivation mode isolation carte');
        
        // Masquer l'overlay
        isolationOverlay.style.opacity = '0';
        
        // Remettre la carte à sa position originale
        const mapElement = activeMap;
        
        // Supprimer la classe d'isolation
        mapElement.classList.remove('map-isolated');
        
        // Permettre à l'animation de sortie de se terminer
        setTimeout(() => {
            // Remettre la carte à son style original
            mapElement.style = '';
            
            // Restaurer le scroll du body
            document.body.style.overflow = originalBodyOverflow || '';
            
            // Cacher l'overlay complètement
            isolationOverlay.style.display = 'none';
            
            // Réactiver les éléments interactifs
            document.querySelectorAll('.tab, a, button').forEach(el => {
                el.style.pointerEvents = '';
            });
            
            // Réinitialiser la carte Leaflet
            const map = mapElement._leaflet_map;
            if (map) {
                setTimeout(() => map.invalidateSize(), 100);
            }
            
            // Réinitialiser l'état
            isMapIsolationActive = false;
            activeMap = null;
            
            // Vibrer pour feedback tactile
            vibrate(25);
        }, 300);
    }
    
    // Utilitaire pour le retour haptique
    function vibrate(duration) {
        if (navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }
    
    // Intercepter les clics sur les onglets pendant que la carte est en focus
    document.addEventListener('click', function(e) {
        if (isMapIsolationActive && e.target.classList.contains('tab')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚫 Clic onglet bloqué pendant mode isolation');
        }
    }, true);
    
    // Exposer pour debug et utilisation externe
    window.MapIsolation = {
        enter: enterMapIsolationMode,
        exit: exitMapIsolationMode,
        isActive: function() { return isMapIsolationActive; }
    };
    
})();
