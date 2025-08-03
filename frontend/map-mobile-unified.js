// SYSTÈME UNIFIÉ OPTIMISÉ - GESTION CARTE MOBILE
// Remplace tous les autres scripts map-mobile-* pour éviter les conflits
(function() {
    'use strict';
    
    // Configuration optimisée
    const CONFIG = {
        TOUCH_TIMEOUT: 150,        // Délai pour détecter un tap vs drag
        ISOLATION_DELAY: 300,      // Délai avant isolation automatique
        DEBOUNCE_DELAY: 16,        // 60fps pour les événements
        MIN_DRAG_DISTANCE: 10,     // Distance minimale pour considérer un drag
        VIBRATION_DURATION: 50     // Retour haptique
    };
    
    // État global unifié
    let state = {
        isMapActive: false,
        isIsolationMode: false,
        activeMap: null,
        touchStartTime: 0,
        touchStartPos: { x: 0, y: 0 },
        lastTouchMove: 0,
        preventTabSwitch: false
    };
    
    // Cache des éléments DOM
    let elements = {
        isolationOverlay: null,
        mapContainers: new Set(),
        tabs: null
    };
    
    // Initialisation principale
    document.addEventListener('DOMContentLoaded', initUnifiedMapSystem);
    
    function initUnifiedMapSystem() {
        console.log('🗺️ Système carte mobile unifié - Initialisation...');
        
        // Attendre Leaflet
        if (typeof L === 'undefined') {
            setTimeout(initUnifiedMapSystem, 100);
            return;
        }
        
        // Créer l'overlay d'isolation
        createIsolationOverlay();
        
        // Observer les cartes
        observeMapCreation();
        
        // Gérer les événements globaux
        setupGlobalEventHandlers();
        
        // Optimisations performances
        setupPerformanceOptimizations();
        
        console.log('✅ Système carte mobile unifié - Prêt');
    }
    
    function createIsolationOverlay() {
        elements.isolationOverlay = document.createElement('div');
        elements.isolationOverlay.className = 'map-isolation-overlay-unified';
        elements.isolationOverlay.innerHTML = `
            <div class="isolation-content">
                <div class="isolation-hint">
                    <div class="hint-icon">🗺️</div>
                    <div class="hint-text">Mode carte activé</div>
                    <div class="hint-subtext">Tapez en dehors pour revenir</div>
                </div>
            </div>
        `;
        
        // Styles optimisés
        elements.isolationOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 9999;
            display: none;
            opacity: 0;
            transition: opacity 0.2s ease;
            backdrop-filter: blur(3px);
            -webkit-backdrop-filter: blur(3px);
        `;
        
        // Styles pour le contenu
        const style = document.createElement('style');
        style.textContent = `
            .isolation-content {
                position: absolute;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 12px 20px;
                border-radius: 25px;
                border: 2px solid #ff0000;
                text-align: center;
                font-family: system-ui, -apple-system, sans-serif;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            }
            
            .hint-icon {
                font-size: 24px;
                margin-bottom: 5px;
            }
            
            .hint-text {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 2px;
            }
            
            .hint-subtext {
                font-size: 11px;
                opacity: 0.8;
            }
            
            .map-interacting .tabs,
            .map-interacting .nav-tabs {
                pointer-events: none !important;
                opacity: 0.5 !important;
                transition: opacity 0.2s ease !important;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(elements.isolationOverlay);
        
        // Gérer la sortie du mode isolation
        elements.isolationOverlay.addEventListener('click', (e) => {
            if (e.target === elements.isolationOverlay) {
                exitIsolationMode();
            }
        });
    }
    
    function observeMapCreation() {
        const observer = new MutationObserver(debounce((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        // Chercher les nouvelles cartes
                        const mapElements = [];
                        
                        if (node.classList?.contains('leaflet-container')) {
                            mapElements.push(node);
                        }
                        
                        if (node.querySelectorAll) {
                            mapElements.push(...node.querySelectorAll('.leaflet-container'));
                        }
                        
                        mapElements.forEach(setupMapOptimizations);
                    }
                });
            });
        }, CONFIG.DEBOUNCE_DELAY));
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    function setupMapOptimizations(mapElement) {
        if (elements.mapContainers.has(mapElement)) return;
        
        console.log('🔧 Optimisation nouvelle carte mobile...');
        elements.mapContainers.add(mapElement);
        
        // Optimisations Leaflet
        optimizeLeafletForMobile(mapElement);
        
        // Gestion des événements tactiles
        setupTouchHandling(mapElement);
        
        // Prévention des conflits
        preventEventConflicts(mapElement);
    }
    
    function optimizeLeafletForMobile(mapElement) {
        // Trouver l'instance Leaflet
        const map = mapElement._leaflet_map;
        if (!map) return;
        
        // Optimisations performances
        map.options.preferCanvas = true;
        map.options.updateWhenIdle = true;
        map.options.updateWhenZooming = false;
        
        // Gestes tactiles optimisés
        if (map.touchZoom) {
            map.touchZoom.options.bounceAtZoomLimits = false;
        }
        
        if (map.dragging) {
            map.dragging.options.debounceTime = CONFIG.DEBOUNCE_DELAY;
        }
    }
    
    function setupTouchHandling(mapElement) {
        let touchData = {
            startTime: 0,
            startPos: { x: 0, y: 0 },
            currentPos: { x: 0, y: 0 },
            isDragging: false
        };
        
        // Touch Start - Optimisé
        mapElement.addEventListener('touchstart', (e) => {
            touchData.startTime = performance.now();
            touchData.isDragging = false;
            
            if (e.touches.length > 0) {
                touchData.startPos.x = e.touches[0].clientX;
                touchData.startPos.y = e.touches[0].clientY;
                touchData.currentPos = { ...touchData.startPos };
            }
            
            state.isMapActive = true;
            state.activeMap = mapElement;
            state.preventTabSwitch = false;
            
            // Marquer le body
            document.body.classList.add('map-interacting');
            
            // Vibration légère
            vibrate(CONFIG.VIBRATION_DURATION);
            
        }, { passive: true });
        
        // Touch Move - Optimisé avec debounce
        mapElement.addEventListener('touchmove', debounce((e) => {
            if (!state.isMapActive) return;
            
            if (e.touches.length > 0) {
                touchData.currentPos.x = e.touches[0].clientX;
                touchData.currentPos.y = e.touches[0].clientY;
                
                const distance = Math.sqrt(
                    Math.pow(touchData.currentPos.x - touchData.startPos.x, 2) +
                    Math.pow(touchData.currentPos.y - touchData.startPos.y, 2)
                );
                
                if (distance > CONFIG.MIN_DRAG_DISTANCE) {
                    touchData.isDragging = true;
                    state.preventTabSwitch = true;
                    
                    // Entrer en mode isolation si drag significatif
                    if (!state.isIsolationMode) {
                        enterIsolationMode();
                    }
                }
            }
        }, CONFIG.DEBOUNCE_DELAY), { passive: true });
        
        // Touch End - Optimisé
        mapElement.addEventListener('touchend', (e) => {
            const touchDuration = performance.now() - touchData.startTime;
            
            // Si c'est un tap rapide sans drag, pas d'isolation
            if (touchDuration < CONFIG.TOUCH_TIMEOUT && !touchData.isDragging) {
                state.preventTabSwitch = false;
            } else {
                // Maintenir la prévention un peu plus longtemps
                setTimeout(() => {
                    state.preventTabSwitch = false;
                }, CONFIG.TOUCH_TIMEOUT);
            }
            
            // Nettoyer l'état après un délai
            setTimeout(() => {
                state.isMapActive = false;
                document.body.classList.remove('map-interacting');
                
                // Sortir du mode isolation si pas d'interaction récente
                if (state.isIsolationMode && !state.isMapActive) {
                    setTimeout(exitIsolationMode, CONFIG.ISOLATION_DELAY);
                }
            }, CONFIG.TOUCH_TIMEOUT);
            
        }, { passive: true });
    }
    
    function preventEventConflicts(mapElement) {
        // Empêcher la propagation vers les onglets
        mapElement.addEventListener('click', (e) => {
            if (state.preventTabSwitch) {
                e.stopPropagation();
            }
        }, true);
        
        // Empêcher le scroll de page pendant l'interaction carte
        mapElement.addEventListener('touchmove', (e) => {
            if (state.isMapActive) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    function setupGlobalEventHandlers() {
        // Intercepter les clics sur les onglets
        document.addEventListener('click', (e) => {
            if (state.preventTabSwitch && e.target.closest('.tab, .nav-tab')) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚫 Changement d\'onglet bloqué - interaction carte active');
                return false;
            }
        }, true);
        
        // Gérer les touches de navigation
        document.addEventListener('keydown', (e) => {
            if (state.isIsolationMode && e.key === 'Escape') {
                exitIsolationMode();
            }
        });
        
        // Optimiser les redimensionnements
        window.addEventListener('resize', debounce(() => {
            if (state.isIsolationMode) {
                exitIsolationMode();
            }
        }, 250));
    }
    
    function setupPerformanceOptimizations() {
        // Désactiver les animations pendant les interactions carte
        const style = document.createElement('style');
        style.textContent = `
            .map-interacting * {
                animation-duration: 0.01ms !important;
                animation-delay: 0.01ms !important;
                transition-duration: 0.01ms !important;
                transition-delay: 0.01ms !important;
            }
            
            .map-interacting .leaflet-container {
                animation: none !important;
                transition: none !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    function enterIsolationMode() {
        if (state.isIsolationMode) return;
        
        state.isIsolationMode = true;
        elements.isolationOverlay.style.display = 'block';
        
        // Animation d'entrée
        requestAnimationFrame(() => {
            elements.isolationOverlay.style.opacity = '1';
        });
        
        // Bloquer le scroll de page
        document.body.style.overflow = 'hidden';
        
        console.log('🔒 Mode isolation carte activé');
    }
    
    function exitIsolationMode() {
        if (!state.isIsolationMode) return;
        
        state.isIsolationMode = false;
        state.preventTabSwitch = false;
        
        // Animation de sortie
        elements.isolationOverlay.style.opacity = '0';
        
        setTimeout(() => {
            elements.isolationOverlay.style.display = 'none';
        }, 200);
        
        // Restaurer le scroll
        document.body.style.overflow = '';
        document.body.classList.remove('map-interacting');
        
        console.log('🔓 Mode isolation carte désactivé');
    }
    
    // Utilitaires optimisés
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    function vibrate(duration = 50) {
        if ('vibrate' in navigator) {
            navigator.vibrate(duration);
        }
    }
    
    // API publique pour debug et contrôle externe
    window.MapMobileUnified = {
        getState: () => ({ ...state }),
        exitIsolationMode,
        enterIsolationMode,
        isActive: () => state.isMapActive,
        isIsolated: () => state.isIsolationMode
    };
    
})();
