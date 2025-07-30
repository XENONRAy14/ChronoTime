// AMÉLIORATIONS D'ACCESSIBILITÉ JAVASCRIPT
// Gestion des attributs ARIA, navigation clavier, et lecteurs d'écran

const AccessibilityEnhancements = {
  
  // Initialiser toutes les améliorations d'accessibilité
  init() {
    this.addSkipLinks();
    this.enhanceKeyboardNavigation();
    this.addAriaAttributes();
    this.improveFormAccessibility();
    this.enhanceModalAccessibility();
    this.setupScreenReaderSupport();
    this.addLiveRegions();
    this.enhanceTabNavigation();
  },
  
  // Ajouter des liens de saut
  addSkipLinks() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Aller au contenu principal';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #ff3333;
      color: white;
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 10001;
      font-weight: bold;
      transition: top 0.3s ease;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Ajouter un ID au contenu principal
    const mainContent = document.getElementById('root') || document.querySelector('main') || document.body;
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content';
    }
    mainContent.setAttribute('tabindex', '-1');
  },
  
  // Améliorer la navigation clavier
  enhanceKeyboardNavigation() {
    // Gestion des touches fléchées pour les onglets
    document.addEventListener('keydown', (e) => {
      const activeElement = document.activeElement;
      
      // Navigation dans les onglets
      if (activeElement && activeElement.classList.contains('tab')) {
        const tabs = Array.from(document.querySelectorAll('.tab'));
        const currentIndex = tabs.indexOf(activeElement);
        
        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % tabs.length;
            tabs[nextIndex].focus();
            break;
            
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            tabs[prevIndex].focus();
            break;
            
          case 'Home':
            e.preventDefault();
            tabs[0].focus();
            break;
            
          case 'End':
            e.preventDefault();
            tabs[tabs.length - 1].focus();
            break;
            
          case 'Enter':
          case ' ':
            e.preventDefault();
            activeElement.click();
            break;
        }
      }
      
      // Échapper pour fermer les modals
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal[style*="display: flex"], .modal[style*="display: block"]');
        if (openModal) {
          const closeBtn = openModal.querySelector('.close, [data-close]');
          if (closeBtn) {
            closeBtn.click();
          }
        }
      }
    });
    
    // Piège de focus pour les modals
    this.setupFocusTrap();
  },
  
  // Ajouter les attributs ARIA
  addAriaAttributes() {
    // Onglets
    const tabsContainer = document.querySelector('.tabs');
    if (tabsContainer) {
      tabsContainer.setAttribute('role', 'tablist');
      
      const tabs = tabsContainer.querySelectorAll('.tab');
      tabs.forEach((tab, index) => {
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1');
        tab.setAttribute('id', `tab-${index}`);
        tab.setAttribute('aria-controls', `tabpanel-${index}`);
      });
      
      // Marquer l'onglet actif
      const activeTab = tabsContainer.querySelector('.tab.active');
      if (activeTab) {
        activeTab.setAttribute('aria-selected', 'true');
        activeTab.setAttribute('tabindex', '0');
      }
    }
    
    // Panneaux d'onglets
    const tabPanels = document.querySelectorAll('.tab-content, .card');
    tabPanels.forEach((panel, index) => {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('id', `tabpanel-${index}`);
      panel.setAttribute('aria-labelledby', `tab-${index}`);
    });
    
    // Boutons
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(button => {
      if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
        const icon = button.querySelector('i, .icon');
        if (icon) {
          button.setAttribute('aria-label', 'Bouton d\'action');
        }
      }
    });
    
    // Formulaires
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (!label && !input.getAttribute('aria-label')) {
        const placeholder = input.getAttribute('placeholder');
        if (placeholder) {
          input.setAttribute('aria-label', placeholder);
        }
      }
      
      // États de validation
      if (input.hasAttribute('required')) {
        input.setAttribute('aria-required', 'true');
      }
    });
    
    // Cartes
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      card.setAttribute('role', 'region');
      const title = card.querySelector('h1, h2, h3, h4, h5, h6');
      if (title && !title.id) {
        title.id = 'card-title-' + Math.random().toString(36).substr(2, 9);
        card.setAttribute('aria-labelledby', title.id);
      }
    });
  },
  
  // Améliorer l'accessibilité des formulaires
  improveFormAccessibility() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      // Grouper les champs liés
      const fieldsets = form.querySelectorAll('fieldset');
      fieldsets.forEach(fieldset => {
        const legend = fieldset.querySelector('legend');
        if (!legend) {
          const firstLabel = fieldset.querySelector('label');
          if (firstLabel) {
            const legend = document.createElement('legend');
            legend.textContent = firstLabel.textContent;
            legend.className = 'sr-only';
            fieldset.insertBefore(legend, fieldset.firstChild);
          }
        }
      });
      
      // Messages d'erreur
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        input.addEventListener('invalid', (e) => {
          const errorId = input.id + '-error';
          let errorMsg = document.getElementById(errorId);
          
          if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.id = errorId;
            errorMsg.className = 'error-message';
            errorMsg.setAttribute('role', 'alert');
            errorMsg.setAttribute('aria-live', 'polite');
            input.parentNode.appendChild(errorMsg);
          }
          
          errorMsg.textContent = input.validationMessage;
          input.setAttribute('aria-describedby', errorId);
          input.setAttribute('aria-invalid', 'true');
        });
        
        input.addEventListener('input', () => {
          if (input.validity.valid) {
            input.removeAttribute('aria-invalid');
            const errorMsg = document.getElementById(input.id + '-error');
            if (errorMsg) {
              errorMsg.textContent = '';
            }
          }
        });
      });
    });
  },
  
  // Améliorer l'accessibilité des modals
  enhanceModalAccessibility() {
    const modals = document.querySelectorAll('.modal, #legal-disclaimer-modal');
    
    modals.forEach(modal => {
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      
      // Titre du modal
      const title = modal.querySelector('h1, h2, h3, h4, h5, h6');
      if (title && !title.id) {
        title.id = 'modal-title-' + Math.random().toString(36).substr(2, 9);
        modal.setAttribute('aria-labelledby', title.id);
      }
      
      // Description du modal
      const description = modal.querySelector('p, .modal-description');
      if (description && !description.id) {
        description.id = 'modal-desc-' + Math.random().toString(36).substr(2, 9);
        modal.setAttribute('aria-describedby', description.id);
      }
    });
  },
  
  // Support pour les lecteurs d'écran
  setupScreenReaderSupport() {
    // Annoncer les changements de contenu
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Annoncer les nouveaux contenus importants
              if (node.classList.contains('card') || node.classList.contains('chrono-item')) {
                this.announceToScreenReader(`Nouveau contenu ajouté: ${node.textContent.substring(0, 100)}`);
              }
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  },
  
  // Ajouter des régions live
  addLiveRegions() {
    // Région pour les annonces
    const announcements = document.createElement('div');
    announcements.id = 'announcements';
    announcements.setAttribute('aria-live', 'polite');
    announcements.setAttribute('aria-atomic', 'true');
    announcements.className = 'sr-only';
    document.body.appendChild(announcements);
    
    // Région pour les alertes
    const alerts = document.createElement('div');
    alerts.id = 'alerts';
    alerts.setAttribute('aria-live', 'assertive');
    alerts.setAttribute('aria-atomic', 'true');
    alerts.className = 'sr-only';
    document.body.appendChild(alerts);
    
    // Région pour le statut
    const status = document.createElement('div');
    status.id = 'status';
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'false');
    status.className = 'sr-only';
    document.body.appendChild(status);
  },
  
  // Améliorer la navigation par onglets
  enhanceTabNavigation() {
    // Gérer les changements d'onglets
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab')) {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
          tab.setAttribute('aria-selected', 'false');
          tab.setAttribute('tabindex', '-1');
        });
        
        e.target.setAttribute('aria-selected', 'true');
        e.target.setAttribute('tabindex', '0');
        
        // Annoncer le changement
        this.announceToScreenReader(`Onglet activé: ${e.target.textContent}`);
      }
    });
  },
  
  // Piège de focus pour les modals
  setupFocusTrap() {
    let focusableElements = [];
    let firstFocusableElement = null;
    let lastFocusableElement = null;
    
    const updateFocusableElements = (container) => {
      focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusableElement = focusableElements[0];
      lastFocusableElement = focusableElements[focusableElements.length - 1];
    };
    
    document.addEventListener('keydown', (e) => {
      const openModal = document.querySelector('.modal[style*="display: flex"], .modal[style*="display: block"]');
      
      if (openModal && e.key === 'Tab') {
        updateFocusableElements(openModal);
        
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            e.preventDefault();
            lastFocusableElement.focus();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            e.preventDefault();
            firstFocusableElement.focus();
          }
        }
      }
    });
  },
  
  // Annoncer aux lecteurs d'écran
  announceToScreenReader(message, priority = 'polite') {
    const regionId = priority === 'assertive' ? 'alerts' : 'announcements';
    const region = document.getElementById(regionId);
    
    if (region) {
      region.textContent = message;
      
      // Effacer après un délai
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  },
  
  // Mettre à jour le statut
  updateStatus(message) {
    const status = document.getElementById('status');
    if (status) {
      status.textContent = message;
    }
  },
  
  // Améliorer les tooltips
  enhanceTooltips() {
    const elementsWithTooltips = document.querySelectorAll('[title]');
    
    elementsWithTooltips.forEach(element => {
      const tooltipText = element.getAttribute('title');
      element.removeAttribute('title');
      
      const tooltipId = 'tooltip-' + Math.random().toString(36).substr(2, 9);
      element.setAttribute('aria-describedby', tooltipId);
      
      const tooltip = document.createElement('div');
      tooltip.id = tooltipId;
      tooltip.className = 'tooltip sr-only';
      tooltip.textContent = tooltipText;
      tooltip.setAttribute('role', 'tooltip');
      
      element.parentNode.appendChild(tooltip);
      
      element.addEventListener('mouseenter', () => {
        tooltip.classList.remove('sr-only');
      });
      
      element.addEventListener('mouseleave', () => {
        tooltip.classList.add('sr-only');
      });
      
      element.addEventListener('focus', () => {
        tooltip.classList.remove('sr-only');
      });
      
      element.addEventListener('blur', () => {
        tooltip.classList.add('sr-only');
      });
    });
  }
};

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
  AccessibilityEnhancements.init();
});

// Export global
window.AccessibilityEnhancements = AccessibilityEnhancements;
