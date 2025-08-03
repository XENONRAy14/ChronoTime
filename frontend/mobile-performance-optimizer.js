// OPTIMISEUR PERFORMANCES MOBILE - SPÉCIAL CARTE
(function() {
    'use strict';
    
    // Configuration optimisations
    const PERF_CONFIG = {
        THROTTLE_INTERVAL: 16,        // 60fps
        DEBOUNCE_DELAY: 100,          // Anti-rebond
        MEMORY_CHECK_INTERVAL: 5000,  // Vérification mémoire
        MAX_MEMORY_USAGE: 100,        // MB max avant nettoyage
        ANIMATION_BUDGET: 16,         // Budget animation par frame
        IDLE_CLEANUP_DELAY: 30000     // Nettoyage après inactivité
    };
    
    // État des performances
    let perfState = {
        isOptimizing: false,
        lastCleanup: 0,
        memoryUsage: 0,
        frameDrops: 0,
        optimizationLevel: 'normal', // normal, aggressive, extreme
        activeOptimizations: new Set()
    };
    
    // Cache et pools d'objets
    let objectPools = {
        events: [],
        elements: [],
        animations: []
    };
    
    // Initialisation
    document.addEventListener('DOMContentLoaded', initPerformanceOptimizer);
    
    function initPerformanceOptimizer() {
        console.log('⚡ Optimiseur performances mobile - Initialisation...');
        
        setupMemoryMonitoring();
        setupFrameRateMonitoring();
        setupEventOptimizations();
        setupAnimationOptimizations();
        setupMapSpecificOptimizations();
        setupIdleCleanup();
        
        console.log('✅ Optimiseur performances - Actif');
    }
    
    function setupMemoryMonitoring() {
        if (!performance.memory) return;
        
        setInterval(() => {
            const memory = performance.memory;
            perfState.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
            
            // Déclenchement nettoyage si nécessaire
            if (perfState.memoryUsage > PERF_CONFIG.MAX_MEMORY_USAGE) {
                triggerMemoryCleanup();
            }
            
            // Ajustement niveau optimisation
            adjustOptimizationLevel();
            
        }, PERF_CONFIG.MEMORY_CHECK_INTERVAL);
    }
    
    function setupFrameRateMonitoring() {
        let lastFrameTime = performance.now();
        let frameCount = 0;
        let droppedFrames = 0;
        
        function monitorFrame() {
            const now = performance.now();
            const frameDelta = now - lastFrameTime;
            
            frameCount++;
            
            // Détecter les frames droppées (> 20ms = < 50fps)
            if (frameDelta > 20) {
                droppedFrames++;
                perfState.frameDrops++;
                
                // Si trop de frames droppées, optimiser
                if (droppedFrames > 5) {
                    enableAggressiveOptimizations();
                    droppedFrames = 0;
                }
            }
            
            // Reset compteurs toutes les secondes
            if (frameCount >= 60) {
                frameCount = 0;
                droppedFrames = 0;
            }
            
            lastFrameTime = now;
            requestAnimationFrame(monitorFrame);
        }
        
        requestAnimationFrame(monitorFrame);
    }
    
    function setupEventOptimizations() {
        // Throttle des événements coûteux
        const throttledEvents = ['scroll', 'resize', 'mousemove', 'touchmove'];
        
        throttledEvents.forEach(eventType => {
            let lastCall = 0;
            
            document.addEventListener(eventType, function(e) {
                const now = performance.now();
                
                if (now - lastCall < PERF_CONFIG.THROTTLE_INTERVAL) {
                    return; // Skip cet événement
                }
                
                lastCall = now;
                
                // Traitement optimisé de l'événement
                processOptimizedEvent(e);
                
            }, { passive: true });
        });
    }
    
    function setupAnimationOptimizations() {
        // Intercepter les animations CSS
        const style = document.createElement('style');
        style.textContent = `
            .performance-optimized * {
                will-change: auto !important;
                transform: translateZ(0) !important;
                backface-visibility: hidden !important;
            }
            
            .performance-aggressive * {
                animation-duration: 0.1s !important;
                transition-duration: 0.1s !important;
            }
            
            .performance-extreme * {
                animation: none !important;
                transition: none !important;
                transform: none !important;
            }
        `;
        document.head.appendChild(style);
        
        // Optimiser les animations Leaflet
        optimizeLeafletAnimations();
    }
    
    function setupMapSpecificOptimizations() {
        // Observer les interactions carte
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('.leaflet-container')) {
                enableMapOptimizations();
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            // Délai avant désactivation
            setTimeout(() => {
                disableMapOptimizations();
            }, 1000);
        }, { passive: true });
    }
    
    function setupIdleCleanup() {
        let idleTimer;
        
        function resetIdleTimer() {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                performIdleCleanup();
            }, PERF_CONFIG.IDLE_CLEANUP_DELAY);
        }
        
        // Reset timer sur activité
        ['touchstart', 'touchmove', 'click', 'scroll'].forEach(eventType => {
            document.addEventListener(eventType, resetIdleTimer, { passive: true });
        });
        
        resetIdleTimer();
    }
    
    function enableMapOptimizations() {
        if (perfState.activeOptimizations.has('map')) return;
        
        perfState.activeOptimizations.add('map');
        
        // Désactiver animations non-essentielles
        document.body.classList.add('performance-optimized');
        
        // Optimiser Leaflet
        optimizeLeafletForPerformance();
        
        // Réduire qualité rendu si nécessaire
        if (perfState.optimizationLevel === 'aggressive') {
            reduceRenderQuality();
        }
        
        console.log('⚡ Optimisations carte activées');
    }
    
    function disableMapOptimizations() {
        if (!perfState.activeOptimizations.has('map')) return;
        
        perfState.activeOptimizations.delete('map');
        
        // Restaurer animations
        document.body.classList.remove('performance-optimized');
        
        // Restaurer qualité rendu
        restoreRenderQuality();
        
        console.log('⚡ Optimisations carte désactivées');
    }
    
    function optimizeLeafletForPerformance() {
        // Trouver toutes les cartes Leaflet
        document.querySelectorAll('.leaflet-container').forEach(container => {
            const map = container._leaflet_map;
            if (!map) return;
            
            // Optimisations Leaflet
            map.options.preferCanvas = true;
            map.options.updateWhenIdle = true;
            map.options.updateWhenZooming = false;
            
            // Réduire fréquence mise à jour
            if (map.dragging) {
                map.dragging.options.debounceTime = PERF_CONFIG.DEBOUNCE_DELAY;
            }
            
            // Optimiser zoom
            if (map.touchZoom) {
                map.touchZoom.options.bounceAtZoomLimits = false;
            }
            
            // Désactiver animations pendant interaction
            map.options.fadeAnimation = false;
            map.options.zoomAnimation = false;
            map.options.markerZoomAnimation = false;
        });
    }
    
    function optimizeLeafletAnimations() {
        // Intercepter les animations Leaflet
        if (typeof L !== 'undefined' && L.DomUtil) {
            const originalSetTransform = L.DomUtil.setTransform;
            
            L.DomUtil.setTransform = function(el, offset, scale) {
                // Optimiser les transformations
                if (perfState.optimizationLevel === 'extreme') {
                    return; // Skip transformations
                }
                
                return originalSetTransform.call(this, el, offset, scale);
            };
        }
    }
    
    function enableAggressiveOptimizations() {
        if (perfState.optimizationLevel === 'aggressive') return;
        
        perfState.optimizationLevel = 'aggressive';
        document.body.classList.add('performance-aggressive');
        
        // Réduire qualité animations
        reduceAnimationQuality();
        
        console.log('⚡ Mode optimisation agressive activé');
    }
    
    function adjustOptimizationLevel() {
        const memoryRatio = perfState.memoryUsage / PERF_CONFIG.MAX_MEMORY_USAGE;
        
        if (memoryRatio > 0.9 || perfState.frameDrops > 10) {
            enableExtremeOptimizations();
        } else if (memoryRatio > 0.7 || perfState.frameDrops > 5) {
            enableAggressiveOptimizations();
        } else {
            enableNormalOptimizations();
        }
    }
    
    function enableExtremeOptimizations() {
        if (perfState.optimizationLevel === 'extreme') return;
        
        perfState.optimizationLevel = 'extreme';
        document.body.classList.remove('performance-aggressive');
        document.body.classList.add('performance-extreme');
        
        // Désactiver toutes animations
        disableAllAnimations();
        
        // Forcer garbage collection si possible
        if (window.gc) {
            window.gc();
        }
        
        console.log('⚡ Mode optimisation EXTRÊME activé');
    }
    
    function enableNormalOptimizations() {
        if (perfState.optimizationLevel === 'normal') return;
        
        perfState.optimizationLevel = 'normal';
        document.body.classList.remove('performance-aggressive', 'performance-extreme');
        
        // Restaurer animations normales
        restoreNormalAnimations();
        
        console.log('⚡ Mode optimisation normal restauré');
    }
    
    function triggerMemoryCleanup() {
        const now = performance.now();
        
        // Éviter nettoyages trop fréquents
        if (now - perfState.lastCleanup < 5000) return;
        
        perfState.lastCleanup = now;
        
        console.log('🧹 Nettoyage mémoire déclenché...');
        
        // Nettoyer caches
        cleanupObjectPools();
        cleanupEventListeners();
        cleanupDOMNodes();
        
        // Forcer garbage collection
        if (window.gc) {
            window.gc();
        }
        
        console.log('✅ Nettoyage mémoire terminé');
    }
    
    function performIdleCleanup() {
        console.log('🧹 Nettoyage inactivité...');
        
        // Nettoyer ressources non utilisées
        cleanupUnusedResources();
        
        // Optimiser DOM
        optimizeDOMStructure();
        
        // Reset compteurs
        perfState.frameDrops = 0;
    }
    
    function cleanupObjectPools() {
        // Vider les pools d'objets
        Object.keys(objectPools).forEach(pool => {
            objectPools[pool].length = 0;
        });
    }
    
    function cleanupEventListeners() {
        // Supprimer listeners orphelins (difficile à implémenter parfaitement)
        // Pour l'instant, juste loguer
        console.log('🧹 Nettoyage event listeners...');
    }
    
    function cleanupDOMNodes() {
        // Supprimer éléments cachés ou inutiles
        const hiddenElements = document.querySelectorAll('[style*="display: none"]');
        hiddenElements.forEach(el => {
            if (el.dataset.keepHidden !== 'true') {
                el.remove();
            }
        });
    }
    
    function cleanupUnusedResources() {
        // Nettoyer images non visibles
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!isElementVisible(img)) {
                img.src = ''; // Libérer mémoire image
            }
        });
    }
    
    function optimizeDOMStructure() {
        // Simplifier structure DOM si possible
        const emptyElements = document.querySelectorAll('div:empty, span:empty');
        emptyElements.forEach(el => {
            if (!el.classList.length && !el.id) {
                el.remove();
            }
        });
    }
    
    function processOptimizedEvent(event) {
        // Traitement optimisé des événements
        if (perfState.optimizationLevel === 'extreme') {
            return; // Skip traitement
        }
        
        // Traitement normal ou réduit selon niveau
    }
    
    function reduceRenderQuality() {
        const style = document.createElement('style');
        style.id = 'reduced-quality';
        style.textContent = `
            * {
                image-rendering: pixelated !important;
                text-rendering: optimizeSpeed !important;
            }
            
            .leaflet-container {
                image-rendering: auto !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    function restoreRenderQuality() {
        const style = document.getElementById('reduced-quality');
        if (style) {
            style.remove();
        }
    }
    
    function reduceAnimationQuality() {
        // Réduire durée animations
        document.documentElement.style.setProperty('--animation-speed', '0.1s');
    }
    
    function disableAllAnimations() {
        // Désactiver complètement animations
        document.documentElement.style.setProperty('--animation-speed', '0s');
    }
    
    function restoreNormalAnimations() {
        // Restaurer animations normales
        document.documentElement.style.removeProperty('--animation-speed');
    }
    
    function isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }
    
    // API publique
    window.MobilePerformanceOptimizer = {
        getState: () => ({ ...perfState }),
        enableMapOptimizations,
        disableMapOptimizations,
        triggerCleanup: triggerMemoryCleanup,
        setOptimizationLevel: (level) => {
            switch(level) {
                case 'normal': enableNormalOptimizations(); break;
                case 'aggressive': enableAggressiveOptimizations(); break;
                case 'extreme': enableExtremeOptimizations(); break;
            }
        },
        getMemoryUsage: () => perfState.memoryUsage,
        getFrameDrops: () => perfState.frameDrops
    };
    
})();
