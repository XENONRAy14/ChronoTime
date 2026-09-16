// ChronoTime Admin Interface - Utilise les API backend authentifiées

// Vérifier si l'utilisateur courant est admin
function isCurrentUserAdmin() {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    const user = JSON.parse(userStr);
    return user.isAdmin === true;
  } catch (e) {
    return false;
  }
}

// Initialisation de l'interface d'administration
(function() {
  function initAdminInterface() {
    if (!window.API) {
      setTimeout(initAdminInterface, 2000);
      return;
    }
    
    if (!window.AdminFunctions) {
      window.AdminFunctions = {};
    }
    
    // Charger les données admin via l'API backend authentifiée
    window.AdminFunctions.loadAdminData = async function() {
      try {
        const users = await window.API.getAllUsers();
        return { users, error: null };
      } catch (error) {
        return { users: [], error: error.message };
      }
    };
    
    window.AdminFunctions.getAdminStats = async function() {
      try {
        const stats = await window.API.getAdminStats();
        return { stats };
      } catch (error) {
        return { stats: null };
      }
    };
    
    window.AdminFunctions.deleteUser = async function(userId) {
      try {
        return await window.API.deleteUser(userId);
      } catch (error) {
        return { success: false, message: error.message };
      }
    };
    
    window.AdminFunctions.promoteUser = async function(userId) {
      try {
        return await window.API.promoteUser(userId);
      } catch (error) {
        return { success: false, message: error.message };
      }
    };
    
    window.AdminFunctions.demoteUser = async function(userId) {
      try {
        return await window.API.demoteUser(userId);
      } catch (error) {
        return { success: false, message: error.message };
      }
    };
    
    // Ajouter l'onglet d'administration si l'utilisateur est admin
    addAdminTab();
  }
  
  function addAdminTab() {
    if (!isCurrentUserAdmin()) return;
    
    const adminTab = document.querySelector('.tab[data-tab="admin"]');
    if (!adminTab) {
      const tabsContainer = document.querySelector('.tabs');
      if (tabsContainer) {
        const newAdminTab = document.createElement('div');
        newAdminTab.className = 'tab';
        newAdminTab.setAttribute('data-tab', 'admin');
        newAdminTab.textContent = 'Administration';
        tabsContainer.appendChild(newAdminTab);
        
        newAdminTab.addEventListener('click', function() {
          const activeTab = document.querySelector('.tab.active');
          if (activeTab) activeTab.classList.remove('active');
          newAdminTab.classList.add('active');
          
          const tabContentElements = document.querySelectorAll('.tab-content');
          tabContentElements.forEach(el => { el.style.display = 'none'; });
          
          const adminTabContent = document.querySelector('.tab-content[data-tab="admin"]');
          if (adminTabContent) adminTabContent.style.display = 'block';
        });
      }
    }
  }
  
  initAdminInterface();
  
  window.addEventListener('load', function() {
    initAdminInterface();
    addAdminTab();
  });
})();
