// FORCE CLEAN - SUPPRESSION RADICALE DES DISCLAIMERS
// Script ultra-agressif pour éliminer TOUS les disclaimers parasites

const ForceCleanDisclaimers = {
  
  init() {
    console.log('🚨 FORCE CLEAN - Suppression radicale des disclaimers !');
    
    // Nettoyage immédiat
    this.forceCleanAll();
    
    // Nettoyage répétitif toutes les 500ms pendant 10 secondes
    let cleanCount = 0;
    const cleanInterval = setInterval(() => {
      this.forceCleanAll();
      cleanCount++;
      
      if (cleanCount >= 20) { // 10 secondes
        clearInterval(cleanInterval);
        console.log('✅ Nettoyage forcé terminé');
      }
    }, 500);
    
    // Observer permanent pour détecter les nouveaux parasites
    this.setupPermanentObserver();
  },
  
  forceCleanAll() {
    // 1. SUPPRIMER PAR ID
    const idsToRemove = [
      'permanent-disclaimer',
      'legal-disclaimer-modal',
      'terms-access-btn',
      'disclaimer-popup',
      'warning-banner',
      'legal-warning',
      'disclaimer-overlay',
      'disclaimer-modal',
      'legal-popup'
    ];
    
    idsToRemove.forEach(id => {
      const elements = document.querySelectorAll(`#${id}, [id*="${id}"]`);
      elements.forEach(el => {
        if (el.id !== 'legal-footer' && el.id !== 'legal-disclaimer-modal') {
          console.log(`❌ Suppression ID: ${el.id}`);
          el.remove();
        }
      });
    });
    
    // 2. SUPPRIMER PAR CLASSE
    const classesToRemove = [
      'disclaimer',
      'warning',
      'legal-notice',
      'terms-button',
      'popup',
      'modal'
    ];
    
    classesToRemove.forEach(className => {
      const elements = document.querySelectorAll(`[class*="${className}"]`);
      elements.forEach(el => {
        if (!el.closest('#legal-footer') && 
            el.id !== 'legal-footer' &&
            !el.classList.contains('card') &&
            !el.classList.contains('container')) {
          console.log(`❌ Suppression classe: ${className}`);
          el.remove();
        }
      });
    });
    
    // 3. SUPPRIMER PAR CONTENU TEXTE
    const textsToRemove = [
      'USAGE PRIVÉ UNIQUEMENT',
      'TERRAIN PRIVÉ EXCLUSIVEMENT',
      'AUCUNE RESPONSABILITÉ DU DÉVELOPPEUR',
      'AVERTISSEMENT',
      'DISCLAIMER',
      'CONDITIONS GÉNÉRALES',
      'RESPONSABILITÉ'
    ];
    
    textsToRemove.forEach(text => {
      this.removeElementsWithText(text);
    });
    
    // 4. SUPPRIMER LES ÉLÉMENTS FIXES EN BAS (SAUF LE BON)
    const fixedElements = document.querySelectorAll('*');
    fixedElements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.position === 'fixed' && 
          style.bottom === '0px' && 
          el.id !== 'legal-footer' &&
          el.id !== 'legal-disclaimer-modal' &&
          !el.closest('#legal-disclaimer-modal') &&
          el.textContent.includes('RESPONSABILITÉ')) {
        console.log('❌ Suppression élément fixe en bas:', el);
        el.remove();
      }
    });
    
    // 5. SUPPRIMER LES OVERLAYS
    const overlays = document.querySelectorAll('[style*="position: fixed"], [style*="z-index: 10000"]');
    overlays.forEach(el => {
      if (el.id !== 'legal-footer' && 
          el.id !== 'legal-disclaimer-modal' &&
          !el.closest('#legal-footer') &&
          !el.closest('#legal-disclaimer-modal') &&
          !el.classList.contains('toast-container') &&
          !el.classList.contains('theme-selector') &&
          (el.textContent.includes('PRIVÉ') || 
           el.textContent.includes('RESPONSABILITÉ') ||
           el.textContent.includes('AVERTISSEMENT'))) {
        console.log('❌ Suppression overlay:', el);
        el.remove();
      }
    });
    
    // 6. NETTOYER LES STYLES INLINE PROBLÉMATIQUES
    this.cleanInlineStyles();
  },
  
  removeElementsWithText(text) {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    const textNodes = [];
    let node;
    
    while (node = walker.nextNode()) {
      if (node.textContent.includes(text)) {
        textNodes.push(node);
      }
    }
    
    textNodes.forEach(textNode => {
      const element = textNode.parentElement;
      if (element && 
          element.id !== 'legal-footer' && 
          element.id !== 'legal-disclaimer-modal' &&
          !element.closest('#legal-footer') &&
          !element.closest('#legal-disclaimer-modal') &&
          !element.closest('.card') &&
          !element.closest('.cgu-content')) {
        console.log(`❌ Suppression texte "${text}":`, element);
        element.remove();
      }
    });
  },
  
  cleanInlineStyles() {
    // Supprimer les éléments avec des styles inline suspects
    const allElements = document.querySelectorAll('*[style]');
    allElements.forEach(el => {
      const style = el.getAttribute('style');
      if (style && 
          style.includes('position: fixed') && 
          style.includes('bottom: 0') &&
          el.id !== 'legal-footer' &&
          (el.textContent.includes('PRIVÉ') || 
           el.textContent.includes('RESPONSABILITÉ'))) {
        console.log('❌ Suppression style inline suspect:', el);
        el.remove();
      }
    });
  },
  
  setupPermanentObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            // Vérifier immédiatement si c'est un parasite
            if (this.isParasiteElement(node)) {
              console.log('🚨 PARASITE DÉTECTÉ ET ÉLIMINÉ:', node);
              node.remove();
            }
            
            // Vérifier les enfants aussi
            const children = node.querySelectorAll ? node.querySelectorAll('*') : [];
            children.forEach(child => {
              if (this.isParasiteElement(child)) {
                console.log('🚨 PARASITE ENFANT ÉLIMINÉ:', child);
                child.remove();
              }
            });
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'id']
    });
    
    console.log('👁️ Observer permanent activé - AUCUN PARASITE NE PASSERA !');
  },
  
  isParasiteElement(element) {
    if (!element || !element.textContent) return false;
    
    const text = element.textContent;
    const id = element.id || '';
    const className = element.className || '';
    const style = element.getAttribute('style') || '';
    
    // Critères de détection de parasite
    const parasiteTexts = [
      'USAGE PRIVÉ UNIQUEMENT',
      'TERRAIN PRIVÉ EXCLUSIVEMENT',
      'AUCUNE RESPONSABILITÉ DU DÉVELOPPEUR'
    ];
    
    const parasiteIds = [
      'disclaimer',
      'warning',
      'popup',
      'modal'
    ];
    
    const parasiteClasses = [
      'disclaimer',
      'warning',
      'popup',
      'modal'
    ];
    
    // EXCEPTIONS IMPORTANTES (éléments à protéger ABSOLUMENT)
    if (element.id === 'legal-footer' || 
        element.id === 'legal-disclaimer-modal' || // PROTÉGER le modal d'acceptation !
        element.closest('#legal-footer') ||
        element.closest('#legal-disclaimer-modal') || // PROTÉGER tout le contenu du modal !
        element.closest('.card') ||
        element.closest('.cgu-content')) {
      return false;
    }
    
    // Détecter les parasites
    const hasParasiteText = parasiteTexts.some(pText => text.includes(pText));
    const hasParasiteId = parasiteIds.some(pId => id.includes(pId));
    const hasParasiteClass = parasiteClasses.some(pClass => className.includes(pClass));
    const hasParasiteStyle = style.includes('position: fixed') && 
                            style.includes('bottom: 0') && 
                            hasParasiteText;
    
    return hasParasiteText || hasParasiteId || hasParasiteClass || hasParasiteStyle;
  }
};

// Export global
window.ForceCleanDisclaimers = ForceCleanDisclaimers;

// DÉMARRAGE IMMÉDIAT ET AGRESSIF
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ForceCleanDisclaimers.init();
  });
} else {
  ForceCleanDisclaimers.init();
}

// Démarrage supplémentaire après 1 seconde
setTimeout(() => {
  ForceCleanDisclaimers.init();
}, 1000);

console.log('💀 FORCE CLEAN DISCLAIMERS - MODE DESTRUCTION ACTIVÉ !');
