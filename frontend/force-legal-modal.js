// FORCE LEGAL MODAL - Assurer l'affichage du modal d'acceptation
// Script pour garantir que le modal d'acceptation s'affiche correctement

const ForceLegalModal = {
  
  init() {
    console.log('⚖️ Vérification du modal d\'acceptation légale...');
    
    // Attendre que tous les scripts soient chargés
    setTimeout(() => {
      this.checkAndShowModal();
    }, 2000); // 2 secondes pour laisser le temps aux scripts de nettoyage
  },
  
  checkAndShowModal() {
    // TOUJOURS afficher le modal à chaque connexion pour être certain
    console.log('⚖️ AFFICHAGE OBLIGATOIRE du modal d\'acceptation à chaque connexion');
    this.forceShowModal();
  },
  
  hasUserAccepted() {
    // DÉSACTIVÉ - On force l'affichage à chaque fois maintenant
    // Plus de vérification d'acceptation précédente
    return false; // Toujours retourner false pour forcer l'affichage
  },
  
  forceShowModal() {
    // Vérifier si le modal existe déjà
    let existingModal = document.getElementById('legal-disclaimer-modal');
    if (existingModal) {
      console.log('📋 Modal déjà présent, s\'assurer qu\'il est visible');
      existingModal.style.display = 'flex';
      return;
    }
    
    // Vérifier si LegalProtection est disponible
    if (window.LegalProtection && typeof window.LegalProtection.createDisclaimerModal === 'function') {
      console.log('📋 Création du modal via LegalProtection');
      const modal = window.LegalProtection.createDisclaimerModal();
      document.body.appendChild(modal);
    } else {
      console.log('📋 LegalProtection non disponible, création manuelle du modal');
      this.createManualModal();
    }
  },
  
  createManualModal() {
    const modal = document.createElement('div');
    modal.id = 'legal-disclaimer-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: 'Teko', Arial, sans-serif;
    `;

    modal.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        border: 2px solid #ff0000;
        border-radius: 10px;
        padding: 30px;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        color: #ffffff;
        box-shadow: 0 0 30px rgba(255, 0, 0, 0.5);
      ">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #ff0000; font-size: 24px; margin-bottom: 10px; text-transform: uppercase;">
            ⚠️ AVERTISSEMENT LÉGAL ET DÉCHARGE DE RESPONSABILITÉ ⚠️
          </h2>
        </div>
        
        <div style="
          background: #000000;
          border: 1px solid #ff0000;
          padding: 20px;
          margin: 20px 0;
          border-radius: 5px;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-line;
          max-height: 400px;
          overflow-y: auto;
        ">
⚠️ USAGE STRICTEMENT PRIVÉ SUR TERRAIN PRIVÉ UNIQUEMENT ⚠️

EN UTILISANT CETTE APPLICATION, VOUS ACCEPTEZ LES CONDITIONS SUIVANTES :

1. LIMITATION DE RESPONSABILITÉ
   • Le développeur décline toute responsabilité concernant l'utilisation de cette application
   • Cette application est fournie "EN L'ÉTAT" sans garantie d'aucune sorte
   • L'utilisateur assume tous les risques liés à l'utilisation de l'application

2. USAGE AUTORISÉ
   • Cette application est destinée EXCLUSIVEMENT à un usage privé sur terrain privé
   • Toute utilisation sur voie publique est STRICTEMENT INTERDITE
   • L'utilisateur est seul responsable du respect du code de la route et des lois locales

3. SÉCURITÉ ET RESPONSABILITÉ
   • L'utilisateur doit respecter toutes les règles de sécurité en vigueur
   • Le développeur n'est pas responsable des accidents, blessures ou dommages
   • L'utilisation de cette application ne doit jamais compromettre la sécurité

4. DONNÉES ET VIE PRIVÉE
   • L'utilisateur consent à la collecte de données de géolocalisation
   • Les données sont utilisées uniquement pour les fonctionnalités de l'application
   • Aucune donnée n'est vendue ou partagée avec des tiers

5. JURIDICTION
   • Ces conditions sont régies par le droit français
   • Tout litige relève de la compétence des tribunaux français

EN CONTINUANT, VOUS CONFIRMEZ AVOIR LU, COMPRIS ET ACCEPTÉ CES CONDITIONS.
        </div>

        <div style="
          background: #330000;
          border: 1px solid #ff6666;
          padding: 15px;
          margin: 15px 0;
          border-radius: 5px;
          font-size: 13px;
          white-space: pre-line;
        ">
⚠️ AVERTISSEMENT GPS ET GÉOLOCALISATION ⚠️

• La précision GPS peut varier selon les conditions météorologiques et l'environnement
• Ne vous fiez jamais uniquement aux données GPS pour votre sécurité
• Vérifiez toujours votre environnement avant toute manœuvre

TERRAIN PRIVÉ UNIQUEMENT - USAGE PERSONNEL EXCLUSIF
        </div>

        <div style="
          background: #330000;
          border: 1px solid #ff6666;
          padding: 15px;
          margin: 15px 0;
          border-radius: 5px;
          font-size: 13px;
          white-space: pre-line;
        ">
⚠️ AVERTISSEMENT MÉDICAL ⚠️

• Consultez un médecin avant toute activité physique intense
• Cette application ne fournit pas de conseils médicaux
• Arrêtez immédiatement en cas de malaise ou de douleur
• Le développeur n'est pas responsable des problèmes de santé liés à l'utilisation

TERRAIN PRIVÉ UNIQUEMENT - USAGE PERSONNEL EXCLUSIF
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <label style="display: block; margin: 20px 0; font-size: 16px; cursor: pointer;">
            <input type="checkbox" id="accept-terms" style="margin-right: 10px; transform: scale(1.5);">
            <span style="color: #ff0000; font-weight: bold;">
              J'AI LU, COMPRIS ET J'ACCEPTE TOUTES CES CONDITIONS
            </span>
          </label>
          
          <div style="margin-top: 20px;">
            <button id="decline-terms" style="
              background: #666666;
              color: white;
              border: none;
              padding: 15px 30px;
              margin: 0 10px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
              font-family: 'Teko', Arial, sans-serif;
            ">
              REFUSER ET QUITTER
            </button>
            
            <button id="accept-terms-btn" disabled style="
              background: #333333;
              color: #666666;
              border: none;
              padding: 15px 30px;
              margin: 0 10px;
              border-radius: 5px;
              cursor: not-allowed;
              font-size: 16px;
              font-family: 'Teko', Arial, sans-serif;
              transition: all 0.3s;
            ">
              ACCEPTER ET CONTINUER
            </button>
          </div>
        </div>
      </div>
    `;

    // Gestion des événements
    const checkbox = modal.querySelector('#accept-terms');
    const acceptBtn = modal.querySelector('#accept-terms-btn');
    const declineBtn = modal.querySelector('#decline-terms');

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        acceptBtn.disabled = false;
        acceptBtn.style.background = '#ff0000';
        acceptBtn.style.color = 'white';
        acceptBtn.style.cursor = 'pointer';
      } else {
        acceptBtn.disabled = true;
        acceptBtn.style.background = '#333333';
        acceptBtn.style.color = '#666666';
        acceptBtn.style.cursor = 'not-allowed';
      }
    });

    acceptBtn.addEventListener('click', () => {
      if (checkbox.checked) {
        this.recordAcceptance();
        document.body.removeChild(modal);
      }
    });

    declineBtn.addEventListener('click', () => {
      window.location.href = 'about:blank';
    });

    document.body.appendChild(modal);
  },
  
  recordAcceptance() {
    const acceptance = {
      main: true,
      gps: true,
      medical: true,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: 'client-side',
      version: '1.0',
      sessionOnly: true // Marquer comme acceptation de session uniquement
    };
    
    // Enregistrer pour cette session seulement (pas de persistence)
    sessionStorage.setItem('chronotime_legal_acceptance_session', JSON.stringify(acceptance));
    console.log('✅ Acceptation légale enregistrée pour cette session:', acceptance);
    
    // Log d'audit pour traçabilité
    console.log('📋 ACCEPTATION LÉGALE - Session:', {
      timestamp: acceptance.timestamp,
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }
};

// Export global
window.ForceLegalModal = ForceLegalModal;

// Auto-initialisation
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ForceLegalModal.init();
  });
} else {
  ForceLegalModal.init();
}

console.log('⚖️ Force Legal Modal chargé');
