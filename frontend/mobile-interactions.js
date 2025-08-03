// MOBILE INTERACTIONS - SUPER INTERACTIF ET SIMPLE
// Gestion des interactions tactiles avancées

const MobileInteractions = {
  
  init() {
    console.log('🚀 Initialisation des interactions mobiles avancées');
    
    // Détecter si on est sur mobile
    this.isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (this.isMobile) {
      this.setupMobileLayout();
      this.setupTouchInteractions();
      this.setupSwipeGestures();
      this.setupHapticFeedback();
      this.setupMobileOptimizations();
      this.cleanupDesktopElements();
      this.setupMobileNavigation();
      this.setupMobileKeyboard();
    }
  },
  
  // Configuration du layout mobile
  setupMobileLayout() {
    console.log('📱 Configuration du layout mobile');
    
    // Ajuster la viewport
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    
    // Ajouter les classes mobile
    document.body.classList.add('mobile-optimized');
    
    // Réorganiser les éléments
    this.reorganizeElements();
  },
  
  // Réorganiser les éléments pour mobile
  reorganizeElements() {
    // Déplacer user-info en haut à droite
    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
      userInfo.style.cssText = `
        position: fixed !important;
        top: 60px !important;
        right: 10px !important;
        z-index: 999 !important;
        background: rgba(0, 0, 0, 0.9) !important;
        border: 1px solid #ff0000 !important;
        border-radius: 15px !important;
        padding: 8px 12px !important;
        font-size: 11px !important;
        backdrop-filter: blur(10px) !important;
      `;
    }
    
    // Ajuster la navigation
    const navTabs = document.querySelector('.nav-tabs');
    if (navTabs) {
      navTabs.style.cssText = `
        position: relative !important;
        top: auto !important;
        left: auto !important;
        right: auto !important;
        z-index: auto !important;
        background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%) !important;
        border-bottom: 2px solid #ff0000 !important;
        padding: 8px 5px !important;
        display: flex !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        white-space: nowrap !important;
        -webkit-overflow-scrolling: touch !important;
        box-shadow: 0 2px 10px rgba(255, 0, 0, 0.3) !important;
      `;
    }
    
    // Ajuster le container principal
    const container = document.querySelector('.container');
    if (container) {
      container.style.cssText = `
        margin-top: 120px !important;
        padding: 15px !important;
        min-height: calc(100vh - 200px) !important;
      `;
    }
  },
  
  // Interactions tactiles avancées
  setupTouchInteractions() {
    console.log('👆 Configuration des interactions tactiles');
    
    // Effet ripple sur tous les boutons et onglets
    document.addEventListener('touchstart', (e) => {
      const target = e.target.closest('button, .tab, .card');
      if (target) {
        this.createRippleEffect(target, e.touches[0]);
      }
    });
    
    // Feedback tactile désactivé - Interface propre
    // (Animation supprimée car désagréable sur mobile)
  },
  
  // Créer effet ripple
  createRippleEffect(element, touch) {
    const rect = element.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      transform: scale(0);
      animation: ripple 0.6s linear;
      left: ${x - 10}px;
      top: ${y - 10}px;
      width: 20px;
      height: 20px;
      pointer-events: none;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  },
  
  // Gestes de balayage
  setupSwipeGestures() {
    console.log('👈 Configuration des gestes de balayage');
    
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    
    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    });
    
    document.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;
      
      // Swipe horizontal pour changer d'onglet
      if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100 && deltaTime < 300) {
        const tabs = document.querySelectorAll('.tab');
        const activeTab = document.querySelector('.tab.active');
        
        if (activeTab && tabs.length > 1) {
          const currentIndex = Array.from(tabs).indexOf(activeTab);
          let newIndex;
          
          if (deltaX > 0) { // Swipe droite
            newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          } else { // Swipe gauche
            newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          }
          
          tabs[newIndex].click();
          this.showSwipeFeedback(deltaX > 0 ? 'right' : 'left');
        }
      }
    });
  },
  
  // Feedback visuel pour swipe
  showSwipeFeedback(direction) {
    const feedback = document.createElement('div');
    feedback.innerHTML = direction === 'right' ? '👈' : '👉';
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      ${direction === 'right' ? 'right: 20px' : 'left: 20px'};
      font-size: 30px;
      z-index: 10000;
      animation: swipeFeedback 0.5s ease-out;
      pointer-events: none;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.remove();
    }, 500);
  },
  
  // Feedback haptique
  setupHapticFeedback() {
    console.log('📳 Configuration du feedback haptique');
    
    // Vibration pour les actions importantes
    document.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (target && navigator.vibrate) {
        if (target.textContent.includes('Démarrer') || 
            target.textContent.includes('Arrêter') ||
            target.textContent.includes('Connexion')) {
          navigator.vibrate([50, 30, 50]); // Pattern plus complexe
        } else {
          navigator.vibrate(20); // Vibration légère
        }
      }
    });
  },
  
  // Optimisations mobiles
  setupMobileOptimizations() {
    console.log('⚡ Configuration des optimisations mobiles');
    
    // Lazy loading des images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.loading = 'lazy';
    });
    
    // Optimisation du scroll
    document.body.style.cssText += `
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
    `;
    
    // Désactiver le zoom sur les inputs
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        // Empêcher le zoom iOS
        const viewport = document.querySelector('meta[name="viewport"]');
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      });
      
      input.addEventListener('blur', () => {
        // Rétablir le zoom
        const viewport = document.querySelector('meta[name="viewport"]');
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
      });
    });
  },
  
  // Nettoyer les éléments desktop
  cleanupDesktopElements() {
    console.log('🧹 Nettoyage des éléments desktop');
    
    // Supprimer les éléments problématiques
    const elementsToHide = [
      '.terms-access-btn',
      '.permanent-disclaimer',
      '.disclaimer-overlay',
      '[id*="disclaimer"]:not(#legal-footer)',
      '[class*="disclaimer"]:not(#legal-footer)'
    ];
    
    elementsToHide.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.display = 'none';
      });
    });
  },
  
  // Navigation mobile améliorée
  setupMobileNavigation() {
    console.log('🧭 Configuration de la navigation mobile');
    
    // Scroll automatique vers l'onglet actif
    const observeActiveTab = () => {
      const activeTab = document.querySelector('.tab.active');
      const navTabs = document.querySelector('.nav-tabs');
      
      if (activeTab && navTabs) {
        const tabRect = activeTab.getBoundingClientRect();
        const navRect = navTabs.getBoundingClientRect();
        
        if (tabRect.left < navRect.left || tabRect.right > navRect.right) {
          activeTab.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
      }
    };
    
    // Observer les changements d'onglet
    const observer = new MutationObserver(observeActiveTab);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: true
    });
  },
  
  // Gestion du clavier mobile
  setupMobileKeyboard() {
    console.log('⌨️ Configuration du clavier mobile');
    
    // Ajuster la vue quand le clavier apparaît
    let initialViewportHeight = window.innerHeight;
    
    window.addEventListener('resize', () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      if (heightDifference > 150) { // Clavier ouvert
        document.body.classList.add('keyboard-open');
        
        // Scroll vers l'input actif
        const activeInput = document.activeElement;
        if (activeInput && (activeInput.tagName === 'INPUT' || activeInput.tagName === 'TEXTAREA')) {
          setTimeout(() => {
            activeInput.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }, 300);
        }
      } else { // Clavier fermé
        document.body.classList.remove('keyboard-open');
      }
    });
  }
};

// Styles dynamiques pour les animations
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  @keyframes swipeFeedback {
    0% {
      opacity: 0;
      transform: translateY(-50%) scale(0.5);
    }
    50% {
      opacity: 1;
      transform: translateY(-50%) scale(1.2);
    }
    100% {
      opacity: 0;
      transform: translateY(-50%) scale(1);
    }
  }
  
  .keyboard-open {
    padding-bottom: 0 !important;
  }
  
  .keyboard-open .container {
    margin-bottom: 20px !important;
  }
  
  .mobile-optimized {
    touch-action: manipulation;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }
  
  .mobile-optimized input,
  .mobile-optimized textarea {
    -webkit-user-select: text;
    user-select: text;
  }
`;

document.head.appendChild(style);

// Export global
window.MobileInteractions = MobileInteractions;

// Auto-initialisation
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => MobileInteractions.init(), 500);
  });
} else {
  setTimeout(() => MobileInteractions.init(), 500);
}

console.log('📱 Module d\'interactions mobiles chargé');
