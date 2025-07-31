// MOBILE LOGOUT - SOLUTION RADICALE POUR BOUTON DÉCONNEXION
(function() {
    'use strict';
    
    let mobileLogoutBtn = null;
    let currentUser = null;
    
    // Attendre que le DOM soit chargé
    document.addEventListener('DOMContentLoaded', function() {
        initMobileLogout();
        
        // Observer les changements d'authentification
        observeAuthChanges();
    });
    
    function initMobileLogout() {
        console.log('🔧 Initialisation du bouton déconnexion mobile...');
        
        // Vérifier si on est sur mobile
        if (window.innerWidth <= 768) {
            createMobileLogoutButton();
        }
        
        // Écouter les redimensionnements
        window.addEventListener('resize', function() {
            if (window.innerWidth <= 768) {
                if (!mobileLogoutBtn) {
                    createMobileLogoutButton();
                }
            } else {
                removeMobileLogoutButton();
            }
        });
    }
    
    function createMobileLogoutButton() {
        // Supprimer l'ancien bouton s'il existe
        removeMobileLogoutButton();
        
        // Récupérer l'utilisateur actuel
        currentUser = getCurrentUser();
        
        if (!currentUser) {
            console.log('Pas d\'utilisateur connecté, pas de bouton mobile');
            return;
        }
        
        // Créer le bouton flottant
        mobileLogoutBtn = document.createElement('button');
        mobileLogoutBtn.className = 'mobile-logout-btn';
        mobileLogoutBtn.innerHTML = `
            <span style="font-size: 0.6rem; opacity: 0.8;">${currentUser.name || currentUser.username}</span>
            <br>
            <span style="font-size: 0.7rem;">DÉCONNEXION</span>
        `;
        
        // Style inline pour s'assurer qu'il fonctionne
        mobileLogoutBtn.style.cssText = `
            position: fixed !important;
            top: 10px !important;
            left: 10px !important;
            z-index: 9999 !important;
            background: #ff0000 !important;
            color: white !important;
            border: none !important;
            border-radius: 8px !important;
            padding: 6px 10px !important;
            font-size: 0.7rem !important;
            font-weight: bold !important;
            cursor: pointer !important;
            box-shadow: 0 2px 10px rgba(255, 0, 0, 0.5) !important;
            transition: all 0.2s ease !important;
            text-align: center !important;
            line-height: 1.1 !important;
            min-width: 80px !important;
            backdrop-filter: blur(10px) !important;
        `;
        
        // Ajouter les événements
        mobileLogoutBtn.addEventListener('click', handleMobileLogout);
        mobileLogoutBtn.addEventListener('touchstart', function(e) {
            e.stopPropagation();
            this.style.transform = 'scale(0.95)';
        });
        mobileLogoutBtn.addEventListener('touchend', function(e) {
            e.stopPropagation();
            this.style.transform = 'scale(1)';
        });
        
        // Ajouter au DOM
        document.body.appendChild(mobileLogoutBtn);
        
        console.log('✅ Bouton déconnexion mobile créé pour:', currentUser.username);
    }
    
    function removeMobileLogoutButton() {
        if (mobileLogoutBtn && mobileLogoutBtn.parentNode) {
            mobileLogoutBtn.parentNode.removeChild(mobileLogoutBtn);
            mobileLogoutBtn = null;
        }
    }
    
    function handleMobileLogout(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🚪 Déconnexion mobile déclenchée');
        
        // Trouver et déclencher le bouton de déconnexion original
        const originalLogoutBtn = document.querySelector('.logout-button');
        if (originalLogoutBtn) {
            originalLogoutBtn.click();
        } else {
            // Fallback : déconnexion manuelle
            if (window.API && window.API.logout) {
                window.API.logout();
                window.location.reload();
            }
        }
        
        // Supprimer le bouton mobile
        removeMobileLogoutButton();
    }
    
    function getCurrentUser() {
        // Essayer plusieurs méthodes pour récupérer l'utilisateur
        if (window.API && window.API.getCurrentUser) {
            return window.API.getCurrentUser();
        }
        
        // Fallback localStorage
        try {
            const userData = localStorage.getItem('user');
            return userData ? JSON.parse(userData) : null;
        } catch (e) {
            console.warn('Erreur récupération utilisateur:', e);
            return null;
        }
    }
    
    function observeAuthChanges() {
        // Observer les changements dans le DOM pour détecter les connexions/déconnexions
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    // Vérifier si l'état d'authentification a changé
                    const wasLoggedIn = !!currentUser;
                    const isLoggedIn = !!getCurrentUser();
                    
                    if (wasLoggedIn !== isLoggedIn) {
                        if (isLoggedIn && window.innerWidth <= 768) {
                            createMobileLogoutButton();
                        } else {
                            removeMobileLogoutButton();
                        }
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Observer les changements de localStorage
        window.addEventListener('storage', function(e) {
            if (e.key === 'user' || e.key === 'token') {
                setTimeout(() => {
                    const isLoggedIn = !!getCurrentUser();
                    if (isLoggedIn && window.innerWidth <= 768) {
                        createMobileLogoutButton();
                    } else {
                        removeMobileLogoutButton();
                    }
                }, 100);
            }
        });
    }
    
    // Exposer globalement pour debug
    window.MobileLogout = {
        create: createMobileLogoutButton,
        remove: removeMobileLogoutButton,
        getCurrentUser: getCurrentUser
    };
    
})();
