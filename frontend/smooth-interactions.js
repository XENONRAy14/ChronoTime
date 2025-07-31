// SMOOTH INTERACTIONS - EXPÉRIENCE UTILISATEUR PARFAITE
// Interactions fluides et naturelles pour ChronoTime

(function() {
    'use strict';
    
    // Attendre que le DOM soit chargé
    document.addEventListener('DOMContentLoaded', function() {
        initSmoothInteractions();
    });
    
    function initSmoothInteractions() {
        console.log('🎨 Initialisation des interactions fluides...');
        
        // 1. Smooth scroll amélioré
        initSmoothScroll();
        
        // 2. Animations d'apparition progressive
        initProgressiveAnimations();
        
        // 3. Feedback tactile amélioré
        initTouchFeedback();
        
        // 4. Gestion intelligente du focus
        initSmartFocus();
        
        // 5. Transitions de page fluides
        initPageTransitions();
        
        // 6. Optimisations performance
        initPerformanceOptimizations();
        
        console.log('✨ Interactions fluides activées !');
    }
    
    // ===== SMOOTH SCROLL AMÉLIORÉ =====
    function initSmoothScroll() {
        // Intercepter tous les liens d'ancrage
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    smoothScrollTo(targetElement);
                }
            }
        });
        
        // Scroll fluide vers un élément
        function smoothScrollTo(element) {
            const offsetTop = element.offsetTop - 80; // Espace pour header
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }
    
    // ===== ANIMATIONS D'APPARITION PROGRESSIVE =====
    function initProgressiveAnimations() {
        // Observer pour les animations d'apparition
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observer les éléments à animer
        function observeElements() {
            const elements = document.querySelectorAll('.card, .tab, .form-group, .stats-item');
            elements.forEach(el => {
                if (!el.classList.contains('animate-in')) {
                    observer.observe(el);
                }
            });
        }
        
        // Observer initial et re-observer après changements
        observeElements();
        
        // Re-observer après changements de contenu
        const contentObserver = new MutationObserver(function() {
            setTimeout(observeElements, 100);
        });
        
        contentObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // ===== FEEDBACK TACTILE AMÉLIORÉ =====
    function initTouchFeedback() {
        // Ajouter des effets de ripple aux boutons
        document.addEventListener('click', function(e) {
            const button = e.target.closest('.tab, .button, .logout-button, button');
            if (button && !button.classList.contains('no-ripple')) {
                createRippleEffect(button, e);
            }
        });
        
        function createRippleEffect(element, event) {
            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
                z-index: 1000;
            `;
            
            // S'assurer que l'élément parent a position relative
            if (getComputedStyle(element).position === 'static') {
                element.style.position = 'relative';
            }
            
            element.appendChild(ripple);
            
            // Supprimer le ripple après l'animation
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        }
        
        // Ajouter les styles CSS pour l'animation ripple
        if (!document.getElementById('ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
                
                .animate-in {
                    animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // ===== GESTION INTELLIGENTE DU FOCUS =====
    function initSmartFocus() {
        let isUsingKeyboard = false;
        
        // Détecter l'utilisation du clavier
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                isUsingKeyboard = true;
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        // Détecter l'utilisation de la souris
        document.addEventListener('mousedown', function() {
            isUsingKeyboard = false;
            document.body.classList.remove('keyboard-navigation');
        });
        
        // Focus intelligent sur les éléments interactifs
        document.addEventListener('focusin', function(e) {
            if (isUsingKeyboard) {
                e.target.classList.add('keyboard-focused');
            }
        });
        
        document.addEventListener('focusout', function(e) {
            e.target.classList.remove('keyboard-focused');
        });
    }
    
    // ===== TRANSITIONS DE PAGE FLUIDES =====
    function initPageTransitions() {
        // Intercepter les changements d'onglets pour des transitions fluides
        document.addEventListener('click', function(e) {
            const tab = e.target.closest('.tab');
            if (tab && !tab.classList.contains('active')) {
                // Ajouter une classe de transition
                const container = document.querySelector('.container');
                if (container) {
                    container.classList.add('page-transitioning');
                    
                    // Retirer la classe après la transition
                    setTimeout(() => {
                        container.classList.remove('page-transitioning');
                    }, 300);
                }
            }
        });
    }
    
    // ===== OPTIMISATIONS PERFORMANCE =====
    function initPerformanceOptimizations() {
        // Throttle pour les événements de scroll
        let scrollTimeout;
        let isScrolling = false;
        
        window.addEventListener('scroll', function() {
            if (!isScrolling) {
                document.body.classList.add('is-scrolling');
                isScrolling = true;
            }
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                document.body.classList.remove('is-scrolling');
                isScrolling = false;
            }, 150);
        }, { passive: true });
        
        // Optimiser les repaints pendant le scroll
        const style = document.createElement('style');
        style.textContent = `
            .is-scrolling * {
                pointer-events: none !important;
            }
            
            .is-scrolling .user-info {
                pointer-events: auto !important;
            }
            
            .page-transitioning {
                opacity: 0.95;
                transform: scale(0.99);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .keyboard-navigation *:focus {
                outline: 2px solid var(--primary-color) !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 4px rgba(255, 0, 0, 0.2) !important;
            }
            
            .keyboard-focused {
                transform: scale(1.02) !important;
            }
        `;
        document.head.appendChild(style);
        
        // Précharger les images importantes
        preloadCriticalAssets();
    }
    
    // ===== PRÉCHARGEMENT DES ASSETS =====
    function preloadCriticalAssets() {
        // Précharger les images de fond importantes
        const criticalImages = [
            // Ajouter ici les URLs des images critiques si nécessaire
        ];
        
        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
    
    // ===== UTILITAIRES =====
    
    // Debounce function pour optimiser les performances
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
    
    // Throttle function pour les événements fréquents
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Exposer quelques fonctions utiles globalement
    window.ChronoTimeUX = {
        debounce,
        throttle,
        initSmoothInteractions
    };
    
})();
