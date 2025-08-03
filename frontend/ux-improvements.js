// AMÉLIORATIONS UX/UI AVANCÉES
// Toast notifications, loading states, et micro-interactions

const UXImprovements = {
  
  // Initialiser toutes les améliorations UX
  init() {
    this.createToastSystem();
    this.improveLoadingStates();
    this.addMicroInteractions();
    this.improveFormValidation();
    this.addProgressIndicators();
    this.optimizeMapExperience();
  },
  
  // Système de toast notifications moderne
  createToastSystem() {
    // Créer le conteneur de toasts
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
    
    // Remplacer tous les alert() par des toasts
    this.replaceAlerts();
  },
  
  // Remplacer les alert() par des toasts
  replaceAlerts() {
    // Override de la fonction alert globale
    const originalAlert = window.alert;
    window.alert = (message) => {
      this.showToast(message, 'info');
    };
    
    // Override de console.error pour afficher des toasts d'erreur
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      if (args[0] && typeof args[0] === 'string') {
        this.showToast(args[0], 'error');
      }
    };
  },
  
  // Afficher un toast
  showToast(message, type = 'info', duration = 4000) {
    const toast = document.createElement('div');
    const toastId = 'toast-' + Date.now();
    toast.id = toastId;
    
    const colors = {
      success: { bg: '#00ff00', border: '#00cc00' },
      error: { bg: '#ff0000', border: '#cc0000' },
      warning: { bg: '#ff6600', border: '#cc5500' },
      info: { bg: '#0066ff', border: '#0055cc' }
    };
    
    const color = colors[type] || colors.info;
    
    toast.style.cssText = `
      background: linear-gradient(135deg, ${color.bg}22, ${color.bg}11);
      border: 2px solid ${color.border};
      color: #ffffff;
      padding: 15px 20px;
      border-radius: 8px;
      font-family: 'Teko', sans-serif;
      font-size: 1rem;
      max-width: 350px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      pointer-events: auto;
      cursor: pointer;
      transform: translateX(400px);
      transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      animation: slideInRight 0.3s ease forwards;
    `;
    
    // Icônes selon le type
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 1.2rem;">${icons[type] || icons.info}</span>
        <span>${message}</span>
        <span style="margin-left: auto; opacity: 0.7; cursor: pointer;" onclick="UXImprovements.closeToast('${toastId}')">✕</span>
      </div>
    `;
    
    // Ajouter au conteneur
    const container = document.getElementById('toast-container');
    container.appendChild(toast);
    
    // Animation d'entrée
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Fermeture automatique
    setTimeout(() => {
      this.closeToast(toastId);
    }, duration);
    
    // Fermeture au clic
    toast.addEventListener('click', () => {
      this.closeToast(toastId);
    });
  },
  
  // Fermer un toast
  closeToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
      toast.style.transform = 'translateX(400px)';
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  },
  
  // Améliorer les états de chargement
  improveLoadingStates() {
    // Créer un loader global
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      backdrop-filter: blur(5px);
    `;
    
    loader.innerHTML = `
      <div style="
        width: 60px;
        height: 60px;
        border: 4px solid rgba(255, 0, 0, 0.3);
        border-top: 4px solid #ff0000;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      "></div>
    `;
    
    document.body.appendChild(loader);
    
    // Ajouter l'animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes slideInRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      .skeleton {
        background: linear-gradient(90deg, #333 25%, #444 50%, #333 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(style);
    
    // Intercepter les requêtes pour afficher le loader
    this.interceptFetchRequests();
  },
  
  // Intercepter les requêtes fetch
  interceptFetchRequests() {
    const originalFetch = window.fetch;
    let activeRequests = 0;
    
    window.fetch = async (...args) => {
      activeRequests++;
      this.showLoader();
      
      try {
        const response = await originalFetch(...args);
        return response;
      } finally {
        activeRequests--;
        if (activeRequests === 0) {
          setTimeout(() => {
            if (activeRequests === 0) {
              this.hideLoader();
            }
          }, 500); // Délai minimum pour éviter le clignotement
        }
      }
    };
  },
  
  // Afficher le loader
  showLoader() {
    const loader = document.getElementById('global-loader');
    if (loader) {
      loader.style.display = 'flex';
    }
  },
  
  // Masquer le loader
  hideLoader() {
    const loader = document.getElementById('global-loader');
    if (loader) {
      loader.style.display = 'none';
    }
  },
  
  // Ajouter des micro-interactions
  addMicroInteractions() {
    // Effet de hover sur tous les boutons
    const style = document.createElement('style');
    style.textContent = `
      button, .btn, .tab {
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease !important;
      }
      
      button:hover, .btn:hover, .tab:hover {
        filter: brightness(1.1) !important;
        box-shadow: 0 5px 15px rgba(255, 0, 0, 0.3) !important;
      }
      
      button:active, .btn:active, .tab:active {
        filter: brightness(0.9) !important;
      }
      
      /* Effet ripple */
      .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
      }
      
      @keyframes ripple-animation {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
      
      /* Animations d'entrée pour les cartes */
      .card {
        animation: fadeInUp 0.5s ease forwards;
        opacity: 0;
        transform: translateY(20px);
      }
      
      @keyframes fadeInUp {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* Effet de focus amélioré */
      input:focus, select:focus, textarea:focus {
        transform: scale(1.02) !important;
        transition: all 0.3s ease !important;
      }
    `;
    document.head.appendChild(style);
    
    // Ajouter l'effet ripple aux boutons
    this.addRippleEffect();
    
    // Animer les cartes à l'apparition
    this.animateCardsOnScroll();
  },
  
  // Effet ripple sur les boutons
  addRippleEffect() {
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (target.tagName === 'BUTTON' || target.classList.contains('btn') || target.classList.contains('tab')) {
        const rect = target.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
        `;
        ripple.classList.add('ripple');
        
        target.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      }
    });
  },
  
  // Animer les cartes au scroll
  animateCardsOnScroll() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationDelay = Math.random() * 0.3 + 's';
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.1 });
    
    // Observer toutes les cartes
    setTimeout(() => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => observer.observe(card));
    }, 1000);
  },
  
  // Améliorer la validation des formulaires
  improveFormValidation() {
    // Validation en temps réel
    document.addEventListener('input', (e) => {
      const input = e.target;
      if (input.tagName === 'INPUT' || input.tagName === 'SELECT' || input.tagName === 'TEXTAREA') {
        this.validateField(input);
      }
    });
  },
  
  // Valider un champ
  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';
    
    // Validation selon le type
    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      isValid = emailRegex.test(value);
      message = isValid ? '' : 'Email invalide';
    } else if (field.type === 'password') {
      isValid = value.length >= 6;
      message = isValid ? '' : 'Minimum 6 caractères';
    } else if (field.required) {
      isValid = value.length > 0;
      message = isValid ? '' : 'Champ requis';
    }
    
    // Appliquer le style de validation
    if (isValid) {
      field.style.borderColor = '#00ff00';
      field.style.boxShadow = '0 0 5px rgba(0, 255, 0, 0.3)';
    } else {
      field.style.borderColor = '#ff0000';
      field.style.boxShadow = '0 0 5px rgba(255, 0, 0, 0.3)';
    }
    
    // Afficher/masquer le message d'erreur
    this.showFieldMessage(field, message, isValid);
  },
  
  // Afficher un message de validation
  showFieldMessage(field, message, isValid) {
    let messageEl = field.parentNode.querySelector('.field-message');
    
    if (message) {
      if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.className = 'field-message';
        messageEl.style.cssText = `
          font-size: 0.8rem;
          margin-top: 5px;
          transition: all 0.3s ease;
        `;
        field.parentNode.appendChild(messageEl);
      }
      
      messageEl.textContent = message;
      messageEl.style.color = isValid ? '#00ff00' : '#ff0000';
    } else if (messageEl) {
      messageEl.remove();
    }
  },
  
  // Ajouter des indicateurs de progression
  addProgressIndicators() {
    // Barre de progression pour les formulaires
    this.addFormProgress();
    
    // Indicateur de scroll
    this.addScrollIndicator();
  },
  
  // Progression des formulaires
  addFormProgress() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const progressBar = document.createElement('div');
      progressBar.className = 'form-progress';
      progressBar.style.cssText = `
        width: 100%;
        height: 4px;
        background: rgba(255, 0, 0, 0.2);
        border-radius: 2px;
        margin-bottom: 20px;
        overflow: hidden;
      `;
      
      const progressFill = document.createElement('div');
      progressFill.style.cssText = `
        height: 100%;
        background: linear-gradient(90deg, #ff0000, #ff6600);
        width: 0%;
        transition: width 0.3s ease;
        border-radius: 2px;
      `;
      
      progressBar.appendChild(progressFill);
      form.insertBefore(progressBar, form.firstChild);
      
      // Mettre à jour la progression
      form.addEventListener('input', () => {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        const filledInputs = Array.from(inputs).filter(input => input.value.trim() !== '');
        const progress = (filledInputs.length / inputs.length) * 100;
        progressFill.style.width = progress + '%';
      });
    });
  },
  
  // Indicateur de scroll
  addScrollIndicator() {
    const scrollIndicator = document.createElement('div');
    scrollIndicator.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, #ff0000, #ff6600);
      z-index: 10000;
      transition: width 0.1s ease;
    `;
    document.body.appendChild(scrollIndicator);
    
    window.addEventListener('scroll', () => {
      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      scrollIndicator.style.width = scrolled + '%';
    });
  },
  
  // Optimiser l'expérience des cartes
  optimizeMapExperience() {
    // Ajouter des états de chargement pour les cartes
    const mapContainers = document.querySelectorAll('#map-container, .map-container');
    mapContainers.forEach(container => {
      // Skeleton loader pour les cartes
      const skeleton = document.createElement('div');
      skeleton.className = 'map-skeleton';
      skeleton.style.cssText = `
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, #333 25%, #444 50%, #333 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 8px;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
      `;
      
      container.style.position = 'relative';
      container.appendChild(skeleton);
      
      // Masquer le skeleton quand la carte est chargée
      setTimeout(() => {
        if (skeleton.parentNode) {
          skeleton.style.opacity = '0';
          setTimeout(() => {
            if (skeleton.parentNode) {
              skeleton.parentNode.removeChild(skeleton);
            }
          }, 300);
        }
      }, 2000);
    });
  }
};

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
  UXImprovements.init();
});

// Export global
window.UXImprovements = UXImprovements;
