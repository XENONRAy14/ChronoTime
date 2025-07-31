// RESET LEGAL ACCEPTANCE - Pour tester le modal d'acceptation
// Script pour effacer l'acceptation et forcer le réaffichage du modal

const ResetLegalAcceptance = {
  
  reset() {
    console.log('🔄 Suppression de l\'acceptation légale stockée...');
    
    // Supprimer de localStorage
    localStorage.removeItem('chronotime_legal_acceptance');
    
    // Supprimer de sessionStorage aussi (au cas où)
    sessionStorage.removeItem('chronotime_legal_acceptance');
    
    console.log('✅ Acceptation légale supprimée - Le modal devrait réapparaître au prochain chargement');
    
    // Recharger la page pour voir le modal
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  },
  
  check() {
    const stored = localStorage.getItem('chronotime_legal_acceptance');
    if (stored) {
      console.log('📋 Acceptation actuelle:', JSON.parse(stored));
    } else {
      console.log('❌ Aucune acceptation trouvée');
    }
  }
};

// Export global
window.ResetLegalAcceptance = ResetLegalAcceptance;

// Ajouter des boutons de test en mode développement
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  setTimeout(() => {
    const testDiv = document.createElement('div');
    testDiv.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 999999;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-size: 12px;
    `;
    
    testDiv.innerHTML = `
      <div>🧪 MODE TEST</div>
      <button onclick="ResetLegalAcceptance.reset()" style="margin: 5px; padding: 5px; font-size: 10px;">
        Reset Modal
      </button>
      <button onclick="ResetLegalAcceptance.check()" style="margin: 5px; padding: 5px; font-size: 10px;">
        Check Status
      </button>
    `;
    
    document.body.appendChild(testDiv);
  }, 3000);
}

console.log('🔄 Reset Legal Acceptance chargé');
