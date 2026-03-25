// Logo animé pour le style Initial D
document.addEventListener('DOMContentLoaded', function() {
  // Créer le conteneur du logo
  const logoContainer = document.createElement('div');
  logoContainer.className = 'logo-container';
  logoContainer.innerHTML = `
    <div class="logo-inner">
      <span class="logo-text">HOONIGAN</span>
      <span class="logo-number">.06</span>
    </div>
    <div class="logo-subtitle">ストリートレーシング</div>
  `;
  
  // Insérer le logo avant le premier élément dans le header
  const header = document.querySelector('header');
  if (header) {
    const firstChild = header.firstChild;
    header.insertBefore(logoContainer, firstChild);
  }
  
  // Ajouter des styles spécifiques au logo
  const style = document.createElement('style');
  style.textContent = `
    .logo-container {
      margin-bottom: 20px;
      position: relative;
      text-align: center;
    }
    
    .logo-inner {
      display: inline-block;
      position: relative;
    }
    
    .logo-text {
      font-family: 'Teko', sans-serif;
      font-size: 4rem;
      font-weight: 700;
      color: #ff0000;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-shadow: 0 0 5px rgba(255, 0, 0, 0.7), 0 0 10px rgba(255, 0, 0, 0.5);
      position: relative;
      z-index: 1;
    }
    
    .logo-number {
      font-family: 'Teko', sans-serif;
      font-size: 3rem;
      font-weight: 700;
      color: #ffffff;
      position: relative;
      z-index: 1;
    }
    
    .logo-subtitle {
      font-family: 'Teko', sans-serif;
      font-size: 1.2rem;
      color: #ffffff;
      opacity: 0.8;
      margin-top: -5px;
    }
    
    .logo-inner::before {
      content: '';
      position: absolute;
      top: 50%;
      left: -10px;
      right: -10px;
      height: 2px;
      background: linear-gradient(to right, transparent, #ff0000, transparent);
      z-index: 0;
    }
    
    .logo-inner::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: linear-gradient(to right, transparent, #ff0000, transparent);
      z-index: 0;
    }
    
    @keyframes pulse {
      0% {
        text-shadow: 0 0 5px rgba(255, 0, 0, 0.7), 0 0 10px rgba(255, 0, 0, 0.5);
      }
      50% {
        text-shadow: 0 0 10px rgba(255, 0, 0, 0.9), 0 0 20px rgba(255, 0, 0, 0.7);
      }
      100% {
        text-shadow: 0 0 5px rgba(255, 0, 0, 0.7), 0 0 10px rgba(255, 0, 0, 0.5);
      }
    }
    
    .logo-text {
      animation: pulse 2s infinite;
    }
  `;
  
  document.head.appendChild(style);
  
  // Masquer le h1 original
  const originalH1 = document.querySelector('header h1');
  if (originalH1) {
    originalH1.style.display = 'none';
  }
});
