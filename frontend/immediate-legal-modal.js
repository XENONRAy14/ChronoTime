// IMMEDIATE LEGAL MODAL - Affichage IMMÉDIAT du modal à chaque chargement
// Script ultra-prioritaire pour garantir l'affichage du modal d'acceptation

const ImmediateLegalModal = {
  
  init() {
    console.log('🚨 MODAL LÉGAL IMMÉDIAT - Affichage obligatoire à chaque connexion');
    
    // Affichage IMMÉDIAT sans délai
    this.showModalNow();
    
    // Double vérification après 500ms
    setTimeout(() => {
      this.ensureModalVisible();
    }, 500);
  },
  
  showModalNow() {
    // Supprimer tout modal existant d'abord
    const existingModal = document.getElementById('legal-disclaimer-modal');
    if (existingModal) {
      existingModal.remove();
    }
    
    // Créer et afficher le modal immédiatement
    const modal = this.createModal();
    document.body.appendChild(modal);
    
    // S'assurer qu'il est visible
    modal.style.display = 'flex';
    modal.style.zIndex = '99999';
    
    console.log('📋 Modal d\'acceptation affiché IMMÉDIATEMENT');
  },
  
  ensureModalVisible() {
    const modal = document.getElementById('legal-disclaimer-modal');
    if (!modal) {
      console.log('⚠️ Modal manquant - Recréation forcée');
      this.showModalNow();
    } else {
      console.log('✅ Modal légal confirmé visible');
    }
  },
  
  createModal() {
    const modal = document.createElement('div');
    modal.id = 'legal-disclaimer-modal';
    modal.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(0, 0, 0, 0.98) !important;
      z-index: 99999 !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      font-family: 'Teko', Arial, sans-serif !important;
      backdrop-filter: blur(5px) !important;
    `;

    modal.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        border: 3px solid #ff0000;
        border-radius: 15px;
        padding: 25px;
        max-width: 90vw;
        max-height: 90vh;
        overflow-y: auto;
        color: #ffffff;
        box-shadow: 0 0 50px rgba(255, 0, 0, 0.8);
        animation: modalAppear 0.5s ease-out;
      ">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #ff0000; font-size: 22px; margin-bottom: 10px; text-transform: uppercase; text-shadow: 0 0 10px rgba(255, 0, 0, 0.5);">
            🚨 ACCEPTATION OBLIGATOIRE À CHAQUE CONNEXION 🚨
          </h2>
          <p style="color: #ff6600; font-size: 14px; margin: 10px 0;">
            SÉCURITÉ JURIDIQUE MAXIMALE - VEUILLEZ LIRE ET ACCEPTER
          </p>
        </div>
        
        <div style="
          background: #000000;
          border: 2px solid #ff0000;
          padding: 20px;
          margin: 20px 0;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.6;
          white-space: pre-line;
          max-height: 300px;
          overflow-y: auto;
          box-shadow: inset 0 0 20px rgba(255, 0, 0, 0.2);
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

⚠️ AVERTISSEMENT GPS : La précision peut varier selon les conditions
⚠️ AVERTISSEMENT MÉDICAL : Consultez un médecin avant toute activité intense

EN CONTINUANT, VOUS CONFIRMEZ AVOIR LU, COMPRIS ET ACCEPTÉ CES CONDITIONS.
        </div>

        <div style="
          background: linear-gradient(45deg, #330000, #660000);
          border: 2px solid #ff6600;
          padding: 15px;
          margin: 20px 0;
          border-radius: 10px;
          text-align: center;
          font-weight: bold;
          color: #ff6600;
          text-shadow: 0 0 5px rgba(255, 102, 0, 0.5);
        ">
          🔒 ACCEPTATION REQUISE À CHAQUE CONNEXION POUR VOTRE SÉCURITÉ 🔒
        </div>

        <div style="text-align: center; margin-top: 25px;">
          <label style="display: block; margin: 20px 0; font-size: 16px; cursor: pointer; padding: 15px; background: rgba(255, 0, 0, 0.1); border-radius: 10px; border: 1px solid #ff0000;">
            <input type="checkbox" id="accept-terms" style="margin-right: 15px; transform: scale(1.8); cursor: pointer;">
            <span style="color: #ff0000; font-weight: bold; text-shadow: 0 0 5px rgba(255, 0, 0, 0.3);">
              ✅ J'AI LU, COMPRIS ET J'ACCEPTE TOUTES CES CONDITIONS
            </span>
          </label>
          
          <div style="margin-top: 25px; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <button id="decline-terms" style="
              background: linear-gradient(45deg, #666666, #999999);
              color: white;
              border: none;
              padding: 15px 25px;
              border-radius: 25px;
              cursor: pointer;
              font-size: 14px;
              font-family: 'Teko', Arial, sans-serif;
              font-weight: bold;
              transition: all 0.3s;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            ">
              ❌ REFUSER ET QUITTER
            </button>
            
            <button id="accept-terms-btn" disabled style="
              background: #333333;
              color: #666666;
              border: none;
              padding: 15px 25px;
              border-radius: 25px;
              cursor: not-allowed;
              font-size: 14px;
              font-family: 'Teko', Arial, sans-serif;
              font-weight: bold;
              transition: all 0.3s;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            ">
              ✅ ACCEPTER ET CONTINUER
            </button>
          </div>
        </div>
      </div>
    `;

    // Ajouter les styles d'animation
    if (!document.getElementById('modal-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'modal-animation-styles';
      style.textContent = `
        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Gestion des événements
    const checkbox = modal.querySelector('#accept-terms');
    const acceptBtn = modal.querySelector('#accept-terms-btn');
    const declineBtn = modal.querySelector('#decline-terms');

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        acceptBtn.disabled = false;
        acceptBtn.style.background = 'linear-gradient(45deg, #ff0000, #ff6600)';
        acceptBtn.style.color = 'white';
        acceptBtn.style.cursor = 'pointer';
        acceptBtn.style.boxShadow = '0 4px 20px rgba(255, 0, 0, 0.5)';
      } else {
        acceptBtn.disabled = true;
        acceptBtn.style.background = '#333333';
        acceptBtn.style.color = '#666666';
        acceptBtn.style.cursor = 'not-allowed';
        acceptBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
      }
    });

    acceptBtn.addEventListener('click', () => {
      if (checkbox.checked) {
        this.recordAcceptance();
        modal.style.animation = 'modalDisappear 0.3s ease-in';
        setTimeout(() => {
          modal.remove();
        }, 300);
      }
    });

    declineBtn.addEventListener('click', () => {
      alert('Vous devez accepter les conditions pour utiliser cette application.');
      // Ne pas fermer l'application, juste montrer l'alerte
    });

    return modal;
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
      sessionOnly: true,
      immediateModal: true
    };
    
    // Enregistrer pour cette session uniquement
    sessionStorage.setItem('chronotime_legal_acceptance_session', JSON.stringify(acceptance));
    
    // Log d'audit complet
    console.log('📋 ACCEPTATION LÉGALE IMMÉDIATE ENREGISTRÉE:', acceptance);
    console.log('🔒 SÉCURITÉ JURIDIQUE: Modal affiché à chaque connexion');
    console.log('⏰ Timestamp:', acceptance.timestamp);
  }
};

// Export global
window.ImmediateLegalModal = ImmediateLegalModal;

// DÉMARRAGE ULTRA-PRIORITAIRE
// Même avant que le DOM soit complètement chargé
ImmediateLegalModal.init();

// Double sécurité au chargement du DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ImmediateLegalModal.init();
  });
} else {
  ImmediateLegalModal.init();
}

console.log('🚨 IMMEDIATE LEGAL MODAL - MODE ULTRA-PRIORITAIRE ACTIVÉ !');
