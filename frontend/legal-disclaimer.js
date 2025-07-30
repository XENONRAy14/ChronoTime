// Module de gestion des disclaimers légaux et protection juridique
// Système de protection légale pour ChronoTime

const LegalProtection = {
  // Configuration des disclaimers
  disclaimers: {
    main: {
      title: "AVERTISSEMENT LÉGAL ET DÉCHARGE DE RESPONSABILITÉ",
      content: `
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
      `,
      version: "1.0",
      lastUpdated: new Date().toISOString()
    },
    
    gps: {
      title: "AVERTISSEMENT GPS ET GÉOLOCALISATION",
      content: `
⚠️ UTILISATION DU GPS - RISQUES ET LIMITATIONS ⚠️

• La précision GPS peut varier selon les conditions météorologiques et l'environnement
• Ne vous fiez jamais uniquement aux données GPS pour votre sécurité
• Gardez toujours votre attention sur votre environnement immédiat
• Cette application ne remplace pas votre jugement personnel et votre prudence

USAGE PRIVÉ UNIQUEMENT - TERRAIN PRIVÉ EXCLUSIVEMENT
      `
    },
    
    medical: {
      title: "AVERTISSEMENT MÉDICAL",
      content: `
⚠️ AVERTISSEMENT MÉDICAL ⚠️

• Consultez un médecin avant toute activité physique intense
• Cette application ne fournit pas de conseils médicaux
• Arrêtez immédiatement en cas de malaise ou de douleur
• Le développeur n'est pas responsable des problèmes de santé liés à l'utilisation

TERRAIN PRIVÉ UNIQUEMENT - USAGE PERSONNEL EXCLUSIF
      `
    }
  },

  // État d'acceptation des disclaimers
  acceptanceStatus: {
    main: false,
    gps: false,
    medical: false,
    timestamp: null
  },

  // Vérifier si tous les disclaimers ont été acceptés
  areAllAccepted() {
    const stored = localStorage.getItem('chronotime_legal_acceptance');
    if (!stored) return false;
    
    try {
      const acceptance = JSON.parse(stored);
      // Vérifier que l'acceptation date de moins de 30 jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return acceptance.main && 
             acceptance.gps && 
             acceptance.medical && 
             new Date(acceptance.timestamp) > thirtyDaysAgo;
    } catch {
      return false;
    }
  },

  // Enregistrer l'acceptation
  recordAcceptance() {
    const acceptance = {
      main: true,
      gps: true,
      medical: true,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: 'client-side', // Sera complété côté serveur si nécessaire
      version: this.disclaimers.main.version
    };
    
    localStorage.setItem('chronotime_legal_acceptance', JSON.stringify(acceptance));
    this.acceptanceStatus = acceptance;
    
    // Log pour audit trail
    console.log('Legal disclaimer accepted:', acceptance);
  },

  // Créer le modal de disclaimer
  createDisclaimerModal() {
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
            ⚠️ ${this.disclaimers.main.title} ⚠️
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
          ${this.disclaimers.main.content}
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
          ${this.disclaimers.gps.content}
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
          ${this.disclaimers.medical.content}
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
      // Rediriger vers une page d'information ou fermer l'application
      window.location.href = 'about:blank';
    });

    return modal;
  },

  // Initialiser la protection légale
  init() {
    // Vérifier si les disclaimers ont été acceptés
    if (!this.areAllAccepted()) {
      // Attendre que le DOM soit chargé
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          document.body.appendChild(this.createDisclaimerModal());
        });
      } else {
        document.body.appendChild(this.createDisclaimerModal());
      }
      
      return false; // Empêcher le chargement de l'application
    }
    
    return true; // Autoriser le chargement de l'application
  },

  // Ajouter un footer de disclaimer permanent
  addPermanentDisclaimer() {
    const footer = document.createElement('div');
    footer.id = 'permanent-disclaimer';
    footer.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.9);
      color: #ff0000;
      text-align: center;
      padding: 5px;
      font-size: 12px;
      z-index: 1000;
      border-top: 1px solid #ff0000;
    `;
    footer.innerHTML = '⚠️ USAGE PRIVÉ UNIQUEMENT - TERRAIN PRIVÉ EXCLUSIVEMENT - AUCUNE RESPONSABILITÉ DU DÉVELOPPEUR ⚠️';
    
    document.body.appendChild(footer);
  },

  // Méthode pour réinitialiser l'acceptation (pour les tests)
  resetAcceptance() {
    localStorage.removeItem('chronotime_legal_acceptance');
    this.acceptanceStatus = {
      main: false,
      gps: false,
      medical: false,
      timestamp: null
    };
  }
};

// Export global
window.LegalProtection = LegalProtection;

// Auto-initialisation
LegalProtection.init();
LegalProtection.addPermanentDisclaimer();
