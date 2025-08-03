// SYSTÈME DE THÈMES AVANCÉ
// Dark/Light mode, thèmes personnalisés, et préférences utilisateur

const ThemeSystem = {
  
  // Configuration des thèmes
  themes: {
    dark: {
      name: 'Initial D Dark',
      primary: '#ff0000',
      secondary: '#ff6600',
      background: '#000000',
      surface: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#cccccc',
      accent: '#ff6600',
      success: '#00ff00',
      warning: '#ffcc00',
      error: '#ff3333',
      gradient: 'linear-gradient(135deg, #000000, #1a1a1a)',
      neon: '0 0 10px',
      racing: true
    },
    light: {
      name: 'Clean Light',
      primary: '#cc0000',
      secondary: '#0088cc',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#333333',
      textSecondary: '#666666',
      accent: '#ff4400',
      success: '#00cc00',
      warning: '#ff9900',
      error: '#cc0000',
      gradient: 'linear-gradient(135deg, #ffffff, #f0f0f0)',
      neon: '0 2px 4px',
      racing: false
    },
    neon: {
      name: 'Neon Racing',
      primary: '#ff0066',
      secondary: '#00ffff',
      background: '#0a0a0a',
      surface: '#1a0a1a',
      text: '#ffffff',
      textSecondary: '#cccccc',
      accent: '#ff6600',
      success: '#00ff66',
      warning: '#ffff00',
      error: '#ff0066',
      gradient: 'linear-gradient(135deg, #0a0a0a, #1a0a1a)',
      neon: '0 0 15px',
      racing: true
    },
    retro: {
      name: 'Retro 90s',
      primary: '#ff3366',
      secondary: '#33ccff',
      background: '#1a1a2e',
      surface: '#16213e',
      text: '#ffffff',
      textSecondary: '#cccccc',
      accent: '#ff6b35',
      success: '#4ecdc4',
      warning: '#ffe66d',
      error: '#ff6b6b',
      gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)',
      neon: '0 0 12px',
      racing: true
    }
  },
  
  currentTheme: 'dark',
  
  // Initialiser le système de thèmes
  init() {
    this.loadUserPreferences();
    this.createThemeControls();
    this.detectSystemPreferences();
    this.applyTheme(this.currentTheme);
    this.setupEventListeners();
  },
  
  // Charger les préférences utilisateur
  loadUserPreferences() {
    const saved = localStorage.getItem('chronotime-theme');
    if (saved && this.themes[saved]) {
      this.currentTheme = saved;
    }
    
    // Charger les préférences d'animation
    const animationPref = localStorage.getItem('chronotime-animations');
    if (animationPref === 'false') {
      document.body.classList.add('reduce-motion');
    }
  },
  
  // Détecter les préférences système
  detectSystemPreferences() {
    // Préférence de couleur système
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      if (!localStorage.getItem('chronotime-theme')) {
        this.currentTheme = 'light';
      }
    }
    
    // Écouter les changements
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('chronotime-theme')) {
          this.currentTheme = e.matches ? 'dark' : 'light';
          this.applyTheme(this.currentTheme);
        }
      });
    }
  },
  
  // Créer les contrôles de thème
  createThemeControls() {
    // Créer le bouton de changement de thème
    const themeButton = document.createElement('button');
    themeButton.id = 'theme-toggle';
    themeButton.className = 'theme-toggle';
    themeButton.innerHTML = '🎨';
    themeButton.setAttribute('aria-label', 'Changer de thème');
    themeButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 80px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 2px solid var(--primary-color);
      background: var(--surface-color);
      color: var(--text-color);
      font-size: 20px;
      cursor: pointer;
      z-index: 1000;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    `;
    
    themeButton.addEventListener('click', () => {
      this.showThemeSelector();
    });
    
    document.body.appendChild(themeButton);
    
    // Créer le sélecteur de thème
    this.createThemeSelector();
  },
  
  // Créer le sélecteur de thème
  createThemeSelector() {
    const selector = document.createElement('div');
    selector.id = 'theme-selector';
    selector.className = 'theme-selector';
    selector.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: var(--surface-color);
      border: 2px solid var(--primary-color);
      border-radius: 12px;
      padding: 20px;
      z-index: 1001;
      display: none;
      min-width: 250px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
    `;
    
    let html = '<h3 style="margin: 0 0 15px 0; color: var(--text-color);">Choisir un thème</h3>';
    
    Object.keys(this.themes).forEach(themeKey => {
      const theme = this.themes[themeKey];
      const isActive = themeKey === this.currentTheme;
      
      html += `
        <div class="theme-option ${isActive ? 'active' : ''}" data-theme="${themeKey}" style="
          display: flex;
          align-items: center;
          padding: 10px;
          margin: 8px 0;
          border-radius: 8px;
          cursor: pointer;
          border: 2px solid ${isActive ? theme.primary : 'transparent'};
          background: ${theme.gradient};
          transition: all 0.3s ease;
        ">
          <div style="
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: ${theme.primary};
            margin-right: 12px;
            box-shadow: ${theme.neon} ${theme.primary};
          "></div>
          <div>
            <div style="color: ${theme.text}; font-weight: bold;">${theme.name}</div>
            <div style="color: ${theme.textSecondary}; font-size: 12px;">
              ${theme.racing ? '🏁 Racing' : '✨ Clean'}
            </div>
          </div>
        </div>
      `;
    });
    
    // Ajouter les options d'animation
    html += `
      <hr style="border: 1px solid var(--primary-color); margin: 15px 0;">
      <div style="color: var(--text-color); margin-bottom: 10px;">
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input type="checkbox" id="animations-toggle" ${!document.body.classList.contains('reduce-motion') ? 'checked' : ''} style="margin-right: 8px;">
          Animations activées
        </label>
      </div>
    `;
    
    selector.innerHTML = html;
    document.body.appendChild(selector);
    
    // Événements
    selector.addEventListener('click', (e) => {
      const option = e.target.closest('.theme-option');
      if (option) {
        const theme = option.dataset.theme;
        this.switchTheme(theme);
        this.hideThemeSelector();
      }
    });
    
    // Toggle animations
    const animToggle = selector.querySelector('#animations-toggle');
    animToggle.addEventListener('change', (e) => {
      this.toggleAnimations(e.target.checked);
    });
  },
  
  // Afficher le sélecteur
  showThemeSelector() {
    const selector = document.getElementById('theme-selector');
    selector.style.display = 'block';
    selector.style.animation = 'fadeInDown 0.3s ease forwards';
    
    // Fermer en cliquant ailleurs
    setTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick.bind(this));
    }, 100);
  },
  
  // Masquer le sélecteur
  hideThemeSelector() {
    const selector = document.getElementById('theme-selector');
    selector.style.animation = 'fadeInUp 0.3s ease forwards';
    setTimeout(() => {
      selector.style.display = 'none';
    }, 300);
    
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
  },
  
  // Gérer les clics extérieurs
  handleOutsideClick(e) {
    const selector = document.getElementById('theme-selector');
    const button = document.getElementById('theme-toggle');
    
    if (!selector.contains(e.target) && !button.contains(e.target)) {
      this.hideThemeSelector();
    }
  },
  
  // Changer de thème
  switchTheme(themeName) {
    if (!this.themes[themeName]) return;
    
    this.currentTheme = themeName;
    this.applyTheme(themeName);
    this.saveUserPreferences();
    
    // Annoncer le changement
    if (window.UXImprovements) {
      window.UXImprovements.showToast(`Thème "${this.themes[themeName].name}" activé`, 'success');
    }
  },
  
  // Appliquer un thème
  applyTheme(themeName) {
    const theme = this.themes[themeName];
    if (!theme) return;
    
    // Appliquer les variables CSS
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--background-color', theme.background);
    root.style.setProperty('--surface-color', theme.surface);
    root.style.setProperty('--text-color', theme.text);
    root.style.setProperty('--text-secondary-color', theme.textSecondary);
    root.style.setProperty('--accent-color', theme.accent);
    root.style.setProperty('--success-color', theme.success);
    root.style.setProperty('--warning-color', theme.warning);
    root.style.setProperty('--error-color', theme.error);
    root.style.setProperty('--gradient-bg', theme.gradient);
    root.style.setProperty('--neon-shadow', theme.neon);
    
    // Appliquer les classes de thème
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${themeName}`);
    
    if (theme.racing) {
      document.body.classList.add('racing-theme');
    } else {
      document.body.classList.remove('racing-theme');
    }
    
    // Mettre à jour les méta-tags
    this.updateMetaTheme(theme);
    
    // Déclencher un événement personnalisé
    const event = new CustomEvent('themeChanged', {
      detail: { theme: themeName, config: theme }
    });
    document.dispatchEvent(event);
  },
  
  // Mettre à jour les méta-tags
  updateMetaTheme(theme) {
    // Couleur de la barre d'état mobile
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.name = 'theme-color';
      document.head.appendChild(metaTheme);
    }
    metaTheme.content = theme.primary;
    
    // Couleur de la barre d'adresse
    let metaAddress = document.querySelector('meta[name="msapplication-navbutton-color"]');
    if (!metaAddress) {
      metaAddress = document.createElement('meta');
      metaAddress.name = 'msapplication-navbutton-color';
      document.head.appendChild(metaAddress);
    }
    metaAddress.content = theme.primary;
  },
  
  // Toggle animations
  toggleAnimations(enabled) {
    if (enabled) {
      document.body.classList.remove('reduce-motion');
      localStorage.setItem('chronotime-animations', 'true');
    } else {
      document.body.classList.add('reduce-motion');
      localStorage.setItem('chronotime-animations', 'false');
    }
    
    if (window.UXImprovements) {
      window.UXImprovements.showToast(
        `Animations ${enabled ? 'activées' : 'désactivées'}`, 
        'info'
      );
    }
  },
  
  // Sauvegarder les préférences
  saveUserPreferences() {
    localStorage.setItem('chronotime-theme', this.currentTheme);
  },
  
  // Setup event listeners
  setupEventListeners() {
    // Écouter les changements de préférences système
    if (window.matchMedia) {
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        if (e.matches) {
          this.toggleAnimations(false);
        }
      });
    }
    
    // Raccourci clavier pour changer de thème
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        this.showThemeSelector();
      }
    });
  },
  
  // Obtenir le thème actuel
  getCurrentTheme() {
    return this.themes[this.currentTheme];
  },
  
  // Créer un thème personnalisé
  createCustomTheme(name, config) {
    this.themes[name] = { ...this.themes.dark, ...config, name };
    this.updateThemeSelector();
  },
  
  // Mettre à jour le sélecteur
  updateThemeSelector() {
    const selector = document.getElementById('theme-selector');
    if (selector) {
      selector.remove();
      this.createThemeSelector();
    }
  }
};

// Styles CSS pour le système de thèmes
const themeStyles = document.createElement('style');
themeStyles.textContent = `
  .theme-toggle:hover {
    filter: brightness(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }
  
  .theme-option:hover {
    filter: brightness(1.1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }
  
  .reduce-motion * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .racing-theme {
    font-family: 'Teko', 'Orbitron', monospace;
  }
  
  .racing-theme .neon-text {
    text-shadow: var(--neon-shadow) var(--primary-color);
  }
  
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-20px);
    }
  }
`;
document.head.appendChild(themeStyles);

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
  ThemeSystem.init();
});

// Export global
window.ThemeSystem = ThemeSystem;
