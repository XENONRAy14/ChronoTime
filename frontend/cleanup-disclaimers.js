// NETTOYAGE DES DISCLAIMERS REDONDANTS
// Script pour supprimer tous les éléments de disclaimer parasites

const DisclaimerCleanup = {
  
  // Nettoyer tous les disclaimers redondants
  cleanupAll() {
    console.log('🧹 Nettoyage des disclaimers redondants...');
    
    // Liste des IDs d'éléments à supprimer s'ils existent
    const elementsToRemove = [
      'permanent-disclaimer',
      'legal-disclaimer-modal',
      'terms-access-btn',
      'offline-indicator'
    ];
    
    elementsToRemove.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        console.log(`❌ Suppression de l'élément: ${id}`);
        element.remove();
      }
    });
    
    // Supprimer tous les éléments avec certaines classes
    const classesToRemove = [
      'disclaimer-overlay',
      'warning-banner',
      'legal-warning'
    ];
    
    classesToRemove.forEach(className => {
      const elements = document.querySelectorAll(`.${className}`);
      elements.forEach(element => {
        console.log(`❌ Suppression d'élément avec classe: ${className}`);
        element.remove();
      });
    });
    
    // Supprimer les éléments avec du texte spécifique
    this.removeElementsWithText('USAGE PRIVÉ UNIQUEMENT');
    this.removeElementsWithText('TERRAIN PRIVÉ EXCLUSIVEMENT');
    this.removeElementsWithText('AUCUNE RESPONSABILITÉ');
    
    // Garder seulement le footer legal officiel
    this.ensureOnlyOneLegalFooter();
    
    console.log('✅ Nettoyage terminé');
  },
  
  // Supprimer les éléments contenant un texte spécifique
  removeElementsWithText(text) {
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      if (element.textContent && 
          element.textContent.includes(text) && 
          element.id !== 'legal-footer' && // Garder le footer officiel
          !element.closest('#legal-footer')) { // Ne pas toucher aux enfants du footer officiel
        
        // Vérifier que ce n'est pas un élément important
        if (!element.closest('.card') && 
            !element.closest('.cgu-content') &&
            element.tagName !== 'SCRIPT') {
          console.log(`❌ Suppression d'élément avec texte "${text}":`, element);
          element.remove();
        }
      }
    });
  },
  
  // S'assurer qu'il n'y a qu'un seul footer legal
  ensureOnlyOneLegalFooter() {
    const legalFooters = document.querySelectorAll('[id*="legal"], [id*="disclaimer"], [class*="legal"], [class*="disclaimer"]');
    
    let officialFooter = document.getElementById('legal-footer');
    
    legalFooters.forEach(footer => {
      if (footer !== officialFooter && 
          footer.style.position === 'fixed' && 
          footer.style.bottom === '0px') {
        console.log('❌ Suppression de footer redondant:', footer);
        footer.remove();
      }
    });
    
    // Si pas de footer officiel, le recréer
    if (!officialFooter && window.LegalFooter) {
      console.log('🔧 Recréation du footer legal officiel');
      document.body.appendChild(window.LegalFooter.createFooter());
    }
  },
  
  // Nettoyer les toasts et notifications parasites
  cleanupToasts() {
    const toasts = document.querySelectorAll('[id*="toast"], [class*="toast"], [class*="notification"]');
    toasts.forEach(toast => {
      if (toast.textContent && 
          (toast.textContent.includes('PRIVÉ') || 
           toast.textContent.includes('RESPONSABILITÉ'))) {
        console.log('❌ Suppression de toast parasite:', toast);
        toast.remove();
      }
    });
  },
  
  // Observer les nouveaux éléments ajoutés
  startObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            // Vérifier si c'est un disclaimer parasite
            if (node.textContent && 
                (node.textContent.includes('USAGE PRIVÉ UNIQUEMENT') ||
                 node.textContent.includes('TERRAIN PRIVÉ EXCLUSIVEMENT')) &&
                node.id !== 'legal-footer' &&
                !node.closest('#legal-footer')) {
              
              console.log('🚨 Disclaimer parasite détecté et supprimé:', node);
              node.remove();
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('👁️ Observer activé pour détecter les disclaimers parasites');
  }
};

// Export global
window.DisclaimerCleanup = DisclaimerCleanup;

// Auto-nettoyage au chargement
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      DisclaimerCleanup.cleanupAll();
      DisclaimerCleanup.startObserver();
    }, 1000); // Attendre que tout soit chargé
  });
} else {
  setTimeout(() => {
    DisclaimerCleanup.cleanupAll();
    DisclaimerCleanup.startObserver();
  }, 1000);
}

console.log('🧹 Script de nettoyage des disclaimers chargé');
