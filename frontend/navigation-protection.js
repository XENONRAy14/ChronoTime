// PROTECTION NAVIGATION - EMPÊCHER LES CHANGEMENTS DE PAGE ACCIDENTELS
(function() {
    'use strict';
    
    // Configuration
    const PROTECTION_CONFIG = {
        PROTECTION_DURATION: 500,    // Durée protection après interaction carte (ms)
        SWIPE_THRESHOLD: 50,         // Distance minimale pour un swipe
        VELOCITY_THRESHOLD: 0.5,     // Vélocité minimale pour un swipe
        DEBOUNCE_DELAY: 100          // Délai anti-rebond
    };
    
    // État de protection
    let protectionState = {
        isMapProtected: false,
        lastMapInteraction: 0,
        swipeData: null,
        protectionTimeout: null,
        blockedActions: 0
    };
    
    // Initialisation
    document.addEventListener('DOMContentLoaded', initNavigationProtection);
    
    function initNavigationProtection() {
        console.log('🛡️ Protection navigation - Initialisation...');
        
        setupSwipeProtection();
        setupTabProtection();
        setupHistoryProtection();
        setupReactProtection();
        
        // Écouter les interactions carte du système unifié
        if (window.MapMobileUnified) {
            monitorMapInteractions();
        }
        
        console.log('✅ Protection navigation - Active');
    }
    
    function setupSwipeProtection() {
        let touchStartData = null;
        
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartData = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                    time: performance.now(),
                    target: e.target
                };
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (!touchStartData || e.changedTouches.length !== 1) return;
            
            const touchEndData = {
                x: e.changedTouches[0].clientX,
                y: e.changedTouches[0].clientY,
                time: performance.now()
            };
            
            const deltaX = touchEndData.x - touchStartData.x;
            const deltaY = touchEndData.y - touchStartData.y;
            const deltaTime = touchEndData.time - touchStartData.time;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const velocity = distance / deltaTime;
            
            // Détecter les swipes horizontaux (navigation)
            if (Math.abs(deltaX) > PROTECTION_CONFIG.SWIPE_THRESHOLD && 
                Math.abs(deltaX) > Math.abs(deltaY) * 2 && 
                velocity > PROTECTION_CONFIG.VELOCITY_THRESHOLD) {
                
                // Si on est en protection carte, bloquer le swipe
                if (isMapProtectionActive()) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    protectionState.blockedActions++;
                    showProtectionFeedback('Swipe bloqué - Mode carte actif');
                    
                    console.log('🚫 Swipe navigation bloqué pendant interaction carte');
                    return false;
                }
            }
            
            touchStartData = null;
        }, { passive: false });
    }
    
    function setupTabProtection() {
        // Intercepter TOUS les clics sur les onglets
        document.addEventListener('click', (e) => {
            const tabElement = e.target.closest('.tab, .nav-tab, [data-tab], [role="tab"]');
            
            if (tabElement && isMapProtectionActive()) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                protectionState.blockedActions++;
                showProtectionFeedback('Changement d\'onglet bloqué');
                
                console.log('🚫 Changement d\'onglet bloqué - interaction carte récente');
                return false;
            }
        }, true); // Capture phase pour intercepter avant React
        
        // Protection spécifique React
        document.addEventListener('click', (e) => {
            if (isMapProtectionActive() && e.target.onclick) {
                const handler = e.target.onclick.toString();
                if (handler.includes('setActiveTab') || handler.includes('switchTab')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    protectionState.blockedActions++;
                    console.log('🚫 Handler React onglet bloqué');
                }
            }
        }, true);
    }
    
    function setupHistoryProtection() {
        // Intercepter les changements d'historique
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        
        history.pushState = function(...args) {
            if (isMapProtectionActive()) {
                console.log('🚫 history.pushState bloqué - interaction carte active');
                showProtectionFeedback('Navigation bloquée');
                return;
            }
            return originalPushState.apply(this, args);
        };
        
        history.replaceState = function(...args) {
            if (isMapProtectionActive()) {
                console.log('🚫 history.replaceState bloqué - interaction carte active');
                return;
            }
            return originalReplaceState.apply(this, args);
        };
        
        // Intercepter les événements popstate
        window.addEventListener('popstate', (e) => {
            if (isMapProtectionActive()) {
                e.preventDefault();
                e.stopPropagation();
                
                // Restaurer l'état précédent
                history.pushState(null, '', location.href);
                
                protectionState.blockedActions++;
                showProtectionFeedback('Navigation arrière bloquée');
                
                console.log('🚫 Navigation arrière bloquée');
            }
        }, true);
    }
    
    function setupReactProtection() {
        // Intercepter les événements React synthétiques
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (type === 'click' && typeof listener === 'function') {
                const protectedListener = function(e) {
                    // Vérifier si c'est un événement React sur un onglet
                    if (isMapProtectionActive() && 
                        (e.target.closest('.tab, .nav-tab') || 
                         e.currentTarget.classList?.contains('tab'))) {
                        
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        
                        protectionState.blockedActions++;
                        showProtectionFeedback('Action React bloquée');
                        
                        console.log('🚫 Event listener React bloqué');
                        return false;
                    }
                    
                    return listener.call(this, e);
                };
                
                return originalAddEventListener.call(this, type, protectedListener, options);
            }
            
            return originalAddEventListener.call(this, type, listener, options);
        };
    }
    
    function monitorMapInteractions() {
        // Surveiller l'état du système carte unifié
        setInterval(() => {
            if (window.MapMobileUnified) {
                const mapState = window.MapMobileUnified.getState();
                
                if (mapState.isMapActive || mapState.isIsolationMode) {
                    activateMapProtection();
                }
            }
        }, 50); // Vérification haute fréquence
    }
    
    function activateMapProtection() {
        protectionState.isMapProtected = true;
        protectionState.lastMapInteraction = performance.now();
        
        // Nettoyer le timeout précédent
        if (protectionState.protectionTimeout) {
            clearTimeout(protectionState.protectionTimeout);
        }
        
        // Programmer la désactivation
        protectionState.protectionTimeout = setTimeout(() => {
            deactivateMapProtection();
        }, PROTECTION_CONFIG.PROTECTION_DURATION);
        
        // Ajouter classe CSS pour feedback visuel
        document.body.classList.add('navigation-protected');
    }
    
    function deactivateMapProtection() {
        protectionState.isMapProtected = false;
        document.body.classList.remove('navigation-protected');
        
        if (protectionState.protectionTimeout) {
            clearTimeout(protectionState.protectionTimeout);
            protectionState.protectionTimeout = null;
        }
    }
    
    function isMapProtectionActive() {
        // Protection active si :
        // 1. Explicitement activée
        // 2. Interaction carte récente
        // 3. Mode isolation actif
        
        const timeSinceLastInteraction = performance.now() - protectionState.lastMapInteraction;
        const recentInteraction = timeSinceLastInteraction < PROTECTION_CONFIG.PROTECTION_DURATION;
        
        const mapState = window.MapMobileUnified?.getState();
        const mapActive = mapState?.isMapActive || mapState?.isIsolationMode;
        
        return protectionState.isMapProtected || recentInteraction || mapActive;
    }
    
    function showProtectionFeedback(message) {
        // Feedback visuel discret
        const feedback = document.createElement('div');
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            z-index: 10001;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;
        
        document.body.appendChild(feedback);
        
        // Animation d'apparition
        requestAnimationFrame(() => {
            feedback.style.opacity = '1';
        });
        
        // Suppression automatique
        setTimeout(() => {
            feedback.style.opacity = '0';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 200);
        }, 1500);
        
        // Vibration
        if ('vibrate' in navigator) {
            navigator.vibrate([50, 30, 50]);
        }
    }
    
    // Styles CSS pour la protection
    const protectionStyles = document.createElement('style');
    protectionStyles.textContent = `
        .navigation-protected .tab,
        .navigation-protected .nav-tab {
            pointer-events: none !important;
            opacity: 0.6 !important;
            filter: grayscale(50%) !important;
            transition: all 0.2s ease !important;
        }
        
        .navigation-protected .tab::after,
        .navigation-protected .nav-tab::after {
            content: '🔒';
            position: absolute;
            top: 2px;
            right: 2px;
            font-size: 10px;
            opacity: 0.7;
        }
    `;
    document.head.appendChild(protectionStyles);
    
    // API publique
    window.NavigationProtection = {
        activate: activateMapProtection,
        deactivate: deactivateMapProtection,
        isActive: isMapProtectionActive,
        getStats: () => ({
            blockedActions: protectionState.blockedActions,
            isProtected: protectionState.isMapProtected,
            lastInteraction: protectionState.lastMapInteraction
        }),
        resetStats: () => {
            protectionState.blockedActions = 0;
        }
    };
    
})();
