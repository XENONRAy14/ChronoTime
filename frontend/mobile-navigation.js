// NAVIGATION MOBILE AMÉLIORÉE
// Système de navigation optimisé pour mobile avec menu hamburger

const MobileNavigation = {
  isMenuOpen: false,
  
  // Initialiser la navigation mobile
  init() {
    this.createMobileMenu();
    this.addSwipeGestures();
    this.optimizeTabNavigation();
    this.addScrollOptimizations();
  },
  
  // Créer le menu hamburger mobile
  createMobileMenu() {
    // Vérifier si on est sur mobile
    if (window.innerWidth <= 768) {
      const header = document.querySelector('header');
      if (header) {
        // Ajouter le bouton hamburger
        const hamburgerBtn = document.createElement('button');
        hamburgerBtn.id = 'mobile-menu-btn';
        hamburgerBtn.innerHTML = '☰';
        hamburgerBtn.style.cssText = `
          position: absolute;
          top: 20px;
          left: 20px;
          background: transparent;
          border: 2px solid #ff0000;
          color: #ff0000;
          font-size: 1.5rem;
          padding: 8px 12px;
          border-radius: 5px;
          cursor: pointer;
          z-index: 1001;
          transition: all 0.3s ease;
        `;
        
        hamburgerBtn.addEventListener('click', () => this.toggleMobileMenu());
        header.appendChild(hamburgerBtn);
      }
    }
  },
  
  // Toggle du menu mobile
  toggleMobileMenu() {
    const tabs = document.querySelector('.tabs');
    const hamburgerBtn = document.getElementById('mobile-menu-btn');
    
    if (!tabs || !hamburgerBtn) return;
    
    this.isMenuOpen = !this.isMenuOpen;
    
    if (this.isMenuOpen) {
      // Ouvrir le menu
      tabs.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background: rgba(0, 0, 0, 0.95) !important;
        z-index: 1000 !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        align-items: center !important;
        gap: 20px !important;
        padding: 20px !important;
        animation: slideInFromTop 0.3s ease !important;
      `;
      
      // Modifier les tabs pour le menu mobile
      const tabElements = tabs.querySelectorAll('.tab');
      tabElements.forEach(tab => {
        tab.style.cssText = `
          width: 80% !important;
          max-width: 300px !important;
          padding: 20px !important;
          font-size: 1.2rem !important;
          text-align: center !important;
          border-radius: 10px !important;
          background: rgba(255, 0, 0, 0.1) !important;
          border: 2px solid #ff0000 !important;
          color: #ffffff !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
        `;
        
        // Fermer le menu quand on clique sur un tab
        tab.addEventListener('click', () => this.closeMobileMenu());
      });
      
      hamburgerBtn.innerHTML = '✕';
      hamburgerBtn.style.background = '#ff0000';
      hamburgerBtn.style.color = '#ffffff';
      
    } else {
      this.closeMobileMenu();
    }
  },
  
  // Fermer le menu mobile
  closeMobileMenu() {
    const tabs = document.querySelector('.tabs');
    const hamburgerBtn = document.getElementById('mobile-menu-btn');
    
    if (!tabs || !hamburgerBtn) return;
    
    this.isMenuOpen = false;
    
    // Restaurer le style normal des tabs
    tabs.style.cssText = '';
    
    const tabElements = tabs.querySelectorAll('.tab');
    tabElements.forEach(tab => {
      tab.style.cssText = '';
    });
    
    hamburgerBtn.innerHTML = '☰';
    hamburgerBtn.style.background = 'transparent';
    hamburgerBtn.style.color = '#ff0000';
  },
  
  // Ajouter les gestes de swipe
  addSwipeGestures() {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    
    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      // Swipe horizontal pour changer d'onglet
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          this.navigateTabs('prev');
        } else {
          this.navigateTabs('next');
        }
      }
      
      // Swipe vers le bas pour fermer le menu
      if (this.isMenuOpen && deltaY > 100) {
        this.closeMobileMenu();
      }
    });
  },
  
  // Navigation entre onglets par swipe
  navigateTabs(direction) {
    const tabs = document.querySelectorAll('.tab');
    const activeTab = document.querySelector('.tab.active');
    
    if (!activeTab || tabs.length === 0) return;
    
    let currentIndex = Array.from(tabs).indexOf(activeTab);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % tabs.length;
    } else {
      newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    }
    
    // Simuler le clic sur le nouvel onglet
    tabs[newIndex].click();
    
    // Feedback visuel
    this.showSwipeFeedback(direction);
  },
  
  // Feedback visuel pour le swipe
  showSwipeFeedback(direction) {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      ${direction === 'next' ? 'right: 20px' : 'left: 20px'};
      transform: translateY(-50%);
      background: rgba(255, 0, 0, 0.8);
      color: white;
      padding: 10px 15px;
      border-radius: 20px;
      font-size: 1.2rem;
      z-index: 10000;
      animation: swipeFeedback 0.5s ease;
    `;
    feedback.innerHTML = direction === 'next' ? '→' : '←';
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      document.body.removeChild(feedback);
    }, 500);
  },
  
  // Optimiser la navigation par onglets
  optimizeTabNavigation() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach((tab, index) => {
      // Ajouter des raccourcis clavier
      tab.setAttribute('data-tab-index', index);
      
      // Améliorer l'accessibilité
      tab.setAttribute('role', 'tab');
      tab.setAttribute('tabindex', '0');
      
      // Ajouter la navigation au clavier
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          tab.click();
        }
        
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.navigateTabs('next');
        }
        
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.navigateTabs('prev');
        }
      });
      
      // Améliorer le feedback tactile
      tab.addEventListener('touchstart', () => {
        tab.style.transform = 'scale(0.95)';
      });
      
      tab.addEventListener('touchend', () => {
        tab.style.transform = 'scale(1)';
      });
    });
  },
  
  // Optimisations de scroll
  addScrollOptimizations() {
    let ticking = false;
    let lastScrollTop = 0;
    
    // Masquer/afficher la navigation lors du scroll
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const tabs = document.querySelector('.tabs');
          
          if (tabs && window.innerWidth <= 768) {
            if (currentScrollTop > lastScrollTop && currentScrollTop > 100) {
              // Scroll vers le bas - masquer
              tabs.style.transform = 'translateY(-100%)';
            } else {
              // Scroll vers le haut - afficher
              tabs.style.transform = 'translateY(0)';
            }
          }
          
          lastScrollTop = currentScrollTop;
          ticking = false;
        });
        
        ticking = true;
      }
    });
    
    // Scroll smooth vers les sections
    this.addSmoothScrolling();
  },
  
  // Ajouter le scroll smooth
  addSmoothScrolling() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Scroll vers le haut après changement d'onglet
        setTimeout(() => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }, 100);
      });
    });
  },
  
  // Gérer le redimensionnement de la fenêtre
  handleResize() {
    if (window.innerWidth > 768 && this.isMenuOpen) {
      this.closeMobileMenu();
    }
    
    // Réinitialiser les styles si on passe en desktop
    if (window.innerWidth > 768) {
      const hamburgerBtn = document.getElementById('mobile-menu-btn');
      if (hamburgerBtn) {
        hamburgerBtn.style.display = 'none';
      }
    } else {
      const hamburgerBtn = document.getElementById('mobile-menu-btn');
      if (hamburgerBtn) {
        hamburgerBtn.style.display = 'block';
      }
    }
  },
  
  // Ajouter les animations CSS
  addAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInFromTop {
        0% {
          transform: translateY(-100%);
          opacity: 0;
        }
        100% {
          transform: translateY(0);
          opacity: 1;
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
      
      .tabs {
        transition: transform 0.3s ease !important;
      }
      
      .tab {
        transition: all 0.3s ease !important;
      }
      
      .tab:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 15px rgba(255, 0, 0, 0.3) !important;
      }
      
      @media (max-width: 768px) {
        .tab:active {
          transform: scale(0.95) !important;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
};

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
  MobileNavigation.init();
  MobileNavigation.addAnimations();
});

// Gérer le redimensionnement
window.addEventListener('resize', () => {
  MobileNavigation.handleResize();
});

// Export global
window.MobileNavigation = MobileNavigation;
