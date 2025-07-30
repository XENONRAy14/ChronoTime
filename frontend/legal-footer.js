// Footer de protection légale permanent
// Ajout d'un disclaimer visible en permanence

const LegalFooter = {
  // Créer le footer de disclaimer permanent
  createFooter() {
    const footer = document.createElement('div');
    footer.id = 'legal-footer';
    footer.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(90deg, #000000 0%, #1a0000 50%, #000000 100%);
      color: #ff0000;
      text-align: center;
      padding: 8px 10px;
      font-size: 11px;
      font-family: 'Teko', monospace;
      z-index: 9999;
      border-top: 2px solid #ff0000;
      box-shadow: 0 -2px 10px rgba(255, 0, 0, 0.3);
      animation: pulse 2s infinite;
      text-transform: uppercase;
      letter-spacing: 1px;
    `;

    footer.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
        <span>⚠️ USAGE PRIVÉ UNIQUEMENT</span>
        <span style="font-weight: bold; animation: blink 1.5s infinite;">TERRAIN PRIVÉ EXCLUSIVEMENT</span>
        <span>AUCUNE RESPONSABILITÉ DU DÉVELOPPEUR ⚠️</span>
      </div>
    `;

    // Ajouter les animations CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { opacity: 0.8; }
        50% { opacity: 1; }
        100% { opacity: 0.8; }
      }
      
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.5; }
      }
      
      #legal-footer:hover {
        background: linear-gradient(90deg, #1a0000 0%, #330000 50%, #1a0000 100%);
        transform: translateY(-2px);
        transition: all 0.3s ease;
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        #legal-footer {
          font-size: 9px;
          padding: 6px 5px;
        }
        
        #legal-footer div {
          flex-direction: column;
          gap: 2px;
        }
      }
    `;
    
    document.head.appendChild(style);
    return footer;
  },

  // Ajouter un bouton d'accès aux conditions
  addTermsButton() {
    const button = document.createElement('button');
    button.id = 'terms-access-btn';
    button.innerHTML = '📋 CGU';
    button.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: #ff0000;
      border: 1px solid #ff0000;
      padding: 8px 12px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 12px;
      font-family: 'Teko', monospace;
      z-index: 9998;
      transition: all 0.3s ease;
    `;

    button.addEventListener('mouseover', () => {
      button.style.background = 'rgba(255, 0, 0, 0.2)';
      button.style.transform = 'scale(1.05)';
    });

    button.addEventListener('mouseout', () => {
      button.style.background = 'rgba(0, 0, 0, 0.8)';
      button.style.transform = 'scale(1)';
    });

    button.addEventListener('click', () => {
      this.showTermsModal();
    });

    return button;
  },

  // Modal pour afficher les conditions complètes
  showTermsModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      z-index: 10001;
      display: flex;
      justify-content: center;
      align-items: center;
    `;

    modal.innerHTML = `
      <div style="
        background: #1a1a1a;
        border: 2px solid #ff0000;
        border-radius: 10px;
        padding: 30px;
        max-width: 800px;
        max-height: 80vh;
        overflow-y: auto;
        color: #ffffff;
      ">
        <h2 style="color: #ff0000; text-align: center; margin-bottom: 20px;">
          CONDITIONS D'UTILISATION
        </h2>
        
        <div style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          <h3 style="color: #ff6666;">⚠️ USAGE STRICTEMENT PRIVÉ</h3>
          <p>Cette application est destinée <strong>EXCLUSIVEMENT</strong> à un usage privé sur terrain privé.</p>
          
          <h3 style="color: #ff6666;">🚫 INTERDICTIONS</h3>
          <ul>
            <li>Usage sur voie publique</li>
            <li>Activités illégales ou dangereuses</li>
            <li>Utilisation commerciale non autorisée</li>
          </ul>
          
          <h3 style="color: #ff6666;">⚖️ RESPONSABILITÉ</h3>
          <p><strong>LE DÉVELOPPEUR DÉCLINE TOUTE RESPONSABILITÉ</strong> concernant :</p>
          <ul>
            <li>Les accidents ou blessures</li>
            <li>L'utilisation non conforme</li>
            <li>Les problèmes techniques</li>
            <li>Les conséquences légales</li>
          </ul>
          
          <h3 style="color: #ff6666;">🏥 AVERTISSEMENT MÉDICAL</h3>
          <p>Consultez un médecin avant toute activité physique intense. Cette application ne fournit pas de conseils médicaux.</p>
          
          <h3 style="color: #ff6666;">📍 AVERTISSEMENT GPS</h3>
          <p>La précision GPS peut varier. Ne vous fiez jamais uniquement aux données GPS pour votre sécurité.</p>
        </div>
        
        <div style="text-align: center;">
          <button id="close-terms" style="
            background: #ff0000;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          ">
            FERMER
          </button>
        </div>
      </div>
    `;

    modal.querySelector('#close-terms').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });

    document.body.appendChild(modal);
  },

  // Initialiser le footer légal
  init() {
    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(this.createFooter());
        document.body.appendChild(this.addTermsButton());
      });
    } else {
      document.body.appendChild(this.createFooter());
      document.body.appendChild(this.addTermsButton());
    }
  }
};

// Auto-initialisation
LegalFooter.init();

// Export global
window.LegalFooter = LegalFooter;
