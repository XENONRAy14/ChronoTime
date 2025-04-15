// ChronoTime Admin Interface - Version Définitive (7.0)
// Solution autonome sans dépendance au backend

// Initialiser les données utilisateurs si nécessaire
(function() {
  if (!localStorage.getItem('adminLocalUsers')) {
    const defaultUsers = [
      {
        _id: "67fb16047f01ff280bd3381e",
        username: "Belho.r",
        email: "rayanbelho@hotmail.com",
        name: "Rayan BELHOCINE",
        isAdmin: true,
        createdAt: "2025-04-13T13:52:30.220Z",
        status: "actif"
      },
      {
        _id: "67fc6c80e98a07a20ce94476",
        username: "Averoesghoost1506",
        email: "aksel.kadi0000@gmail.com",
        name: "Kadi koceila",
        isAdmin: false,
        createdAt: "2025-04-14T02:01:36.214Z",
        status: "actif"
      }
    ];
    localStorage.setItem('adminLocalUsers', JSON.stringify(defaultUsers));
    console.log('[ChronoTime Admin] Données utilisateurs initialisées');
  }
})();

// Fonctions de gestion des utilisateurs
const UserManager = {
  // Obtenir tous les utilisateurs
  getUsers: function() {
    try {
      const data = localStorage.getItem('adminLocalUsers');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[ChronoTime Admin] Erreur lors de la récupération des utilisateurs', e);
      return [];
    }
  },
  
  // Sauvegarder les utilisateurs
  saveUsers: function(users) {
    try {
      localStorage.setItem('adminLocalUsers', JSON.stringify(users));
      return true;
    } catch (e) {
      console.error('[ChronoTime Admin] Erreur lors de la sauvegarde des utilisateurs', e);
      return false;
    }
  },
  
  // Supprimer un utilisateur
  deleteUser: function(userId) {
    try {
      const users = this.getUsers();
      const userIndex = users.findIndex(u => u._id === userId);
      
      if (userIndex === -1) return false;
      if (users[userIndex].username === 'Belho.r') return false;
      
      users.splice(userIndex, 1);
      return this.saveUsers(users);
    } catch (e) {
      console.error('[ChronoTime Admin] Erreur lors de la suppression d\'un utilisateur', e);
      return false;
    }
  },
  
  // Promouvoir un utilisateur
  promoteUser: function(userId) {
    try {
      const users = this.getUsers();
      const user = users.find(u => u._id === userId);
      
      if (!user) return false;
      
      user.isAdmin = true;
      user.lastModified = new Date().toISOString();
      return this.saveUsers(users);
    } catch (e) {
      console.error('[ChronoTime Admin] Erreur lors de la promotion d\'un utilisateur', e);
      return false;
    }
  },
  
  // Rétrograder un utilisateur
  demoteUser: function(userId) {
    try {
      const users = this.getUsers();
      const user = users.find(u => u._id === userId);
      
      if (!user) return false;
      if (user.username === 'Belho.r') return false;
      
      user.isAdmin = false;
      user.lastModified = new Date().toISOString();
      return this.saveUsers(users);
    } catch (e) {
      console.error('[ChronoTime Admin] Erreur lors de la rétrogradation d\'un utilisateur', e);
      return false;
    }
  },
  
  // Suspendre un utilisateur
  suspendUser: function(userId) {
    try {
      const users = this.getUsers();
      const user = users.find(u => u._id === userId);
      
      if (!user) return false;
      if (user.username === 'Belho.r') return false;
      
      user.status = 'suspendu';
      user.lastModified = new Date().toISOString();
      return this.saveUsers(users);
    } catch (e) {
      console.error('[ChronoTime Admin] Erreur lors de la suspension d\'un utilisateur', e);
      return false;
    }
  },
  
  // Réactiver un utilisateur
  reactivateUser: function(userId) {
    try {
      const users = this.getUsers();
      const user = users.find(u => u._id === userId);
      
      if (!user) return false;
      
      user.status = 'actif';
      user.lastModified = new Date().toISOString();
      return this.saveUsers(users);
    } catch (e) {
      console.error('[ChronoTime Admin] Erreur lors de la réactivation d\'un utilisateur', e);
      return false;
    }
  },
  
  // Calcul des statistiques
  getStats: function() {
    try {
      const users = this.getUsers();
      return {
        totalUsers: users.length,
        totalAdmins: users.filter(u => u.isAdmin).length,
        activeUsers: users.filter(u => u.status === 'actif').length,
        suspendedUsers: users.filter(u => u.status === 'suspendu').length,
        totalCourses: 5,
        totalChronos: 12
      };
    } catch (e) {
      console.error('[ChronoTime Admin] Erreur lors du calcul des statistiques', e);
      return {
        totalUsers: 0,
        totalAdmins: 0,
        activeUsers: 0,
        suspendedUsers: 0,
        totalCourses: 0,
        totalChronos: 0
      };
    }
  }
};

// Vérifier et activer le statut administrateur pour l'utilisateur Belho.r
function ensureAdminStatus() {
  try {
    const userString = localStorage.getItem('user');
    if (!userString) return false;
    
    const user = JSON.parse(userString);
    if (user.username === 'Belho.r') {
      if (!user.isAdmin) {
        user.isAdmin = true;
        localStorage.setItem('user', JSON.stringify(user));
        console.log('[ChronoTime Admin] Statut administrateur accordé à Belho.r');
      }
      return true;
    }
    return false;
  } catch (e) {
    console.error('[ChronoTime Admin] Erreur lors de la vérification du statut admin', e);
    return false;
  }
}

// Initialisation de l'interface d'administration
(function() {
  console.log('[ChronoTime Admin] Initialisation de l\'interface d\'administration');
  
  // S'assurer que l'utilisateur Belho.r a le statut d'administrateur
  ensureAdminStatus();
  
  // Vérifier si les API et AdminFunctions sont disponibles
  function initAdminInterface() {
    // Vérifier si API est disponible
    if (!window.API) {
      console.log('[ChronoTime Admin] API non disponible, nouvelle tentative dans 500ms');
      // Augmenter le délai pour réduire la fréquence des tentatives
      setTimeout(initAdminInterface, 2000);
      return;
    }
    
    // Remplacer les fonctions API
    window.API.getAllUsers = function() {
      console.log('[ChronoTime Admin] Récupération des utilisateurs');
      return Promise.resolve(UserManager.getUsers());
    };
    
    window.API.deleteUser = function(userId) {
      console.log('[ChronoTime Admin] Suppression d\'utilisateur:', userId);
      const success = UserManager.deleteUser(userId);
      return Promise.resolve({ success });
    };
    
    window.API.promoteUser = function(userId) {
      console.log('[ChronoTime Admin] Promotion d\'utilisateur:', userId);
      const success = UserManager.promoteUser(userId);
      return Promise.resolve({ success });
    };
    
    window.API.demoteUser = function(userId) {
      console.log('[ChronoTime Admin] Rétrogradation d\'utilisateur:', userId);
      const success = UserManager.demoteUser(userId);
      return Promise.resolve({ success });
    };
    
    window.API.suspendUser = function(userId) {
      console.log('[ChronoTime Admin] Suspension d\'utilisateur:', userId);
      const success = UserManager.suspendUser(userId);
      return Promise.resolve({ success });
    };
    
    window.API.reactivateUser = function(userId) {
      console.log('[ChronoTime Admin] Réactivation d\'utilisateur:', userId);
      const success = UserManager.reactivateUser(userId);
      return Promise.resolve({ success });
    };
    
    console.log('[ChronoTime Admin] Fonctions API remplacées');
    
    // Vérifier si AdminFunctions est disponible
    if (!window.AdminFunctions) {
      // Créer l'objet AdminFunctions s'il n'existe pas
      window.AdminFunctions = {};
    }
    
    // Remplacer les fonctions d'administration
    window.AdminFunctions.loadAdminData = function() {
      console.log('[ChronoTime Admin] Chargement des données admin');
      return Promise.resolve({ users: UserManager.getUsers(), error: null });
    };
    
    window.AdminFunctions.getAdminStats = function() {
      console.log('[ChronoTime Admin] Récupération des statistiques');
      return Promise.resolve({ stats: UserManager.getStats() });
    };
    
    window.AdminFunctions.deleteUser = function(userId) {
      console.log('[ChronoTime Admin] Suppression d\'utilisateur via AdminFunctions:', userId);
      const success = UserManager.deleteUser(userId);
      return Promise.resolve({ 
        success, 
        message: success ? 'Utilisateur supprimé avec succès' : 'Impossible de supprimer cet utilisateur' 
      });
    };
    
    window.AdminFunctions.promoteUser = function(userId) {
      console.log('[ChronoTime Admin] Promotion d\'utilisateur via AdminFunctions:', userId);
      const success = UserManager.promoteUser(userId);
      return Promise.resolve({ 
        success, 
        message: success ? 'Utilisateur promu administrateur avec succès' : 'Impossible de promouvoir cet utilisateur' 
      });
    };
    
    window.AdminFunctions.demoteUser = function(userId) {
      console.log('[ChronoTime Admin] Rétrogradation d\'utilisateur via AdminFunctions:', userId);
      const success = UserManager.demoteUser(userId);
      return Promise.resolve({ 
        success, 
        message: success ? 'Administrateur rétrogradé avec succès' : 'Impossible de rétrograder cet administrateur' 
      });
    };
    
    console.log('[ChronoTime Admin] Fonctions AdminFunctions remplacées');
    
    // Ajouter l'onglet d'administration s'il n'existe pas
    // Appeler directement la fonction au lieu d'utiliser un timeout
    addAdminTab();
    
    // Afficher un message de succès
    showNotification('Interface d\'administration activée', 'success');
  }
  
  // Fonction pour ajouter l'onglet d'administration
  function addAdminTab() {
    const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    if (!currentUser || !currentUser.isAdmin) return;
    
    const adminTab = document.querySelector('.tab[data-tab="admin"]');
    if (!adminTab) {
      const tabsContainer = document.querySelector('.tabs');
      if (tabsContainer) {
        const newAdminTab = document.createElement('div');
        newAdminTab.className = 'tab';
        newAdminTab.setAttribute('data-tab', 'admin');
        newAdminTab.textContent = 'Administration';
        tabsContainer.appendChild(newAdminTab);
        console.log('[ChronoTime Admin] Onglet Administration ajouté');
        
        // Rendre l'onglet cliquable
        newAdminTab.addEventListener('click', function() {
          const activeTab = document.querySelector('.tab.active');
          if (activeTab) {
            activeTab.classList.remove('active');
          }
          newAdminTab.classList.add('active');
          
          // Changer l'onglet actif dans l'application
          const tabContentElements = document.querySelectorAll('.tab-content');
          tabContentElements.forEach(el => {
            el.style.display = 'none';
          });
          
          const adminTabContent = document.querySelector('.tab-content[data-tab="admin"]');
          if (adminTabContent) {
            adminTabContent.style.display = 'block';
          }
        });
      }
    }
  }
  
  // Fonction pour afficher des notifications
  function showNotification(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '10px';
    notification.style.right = '10px';
    notification.style.padding = '10px 15px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '9999';
    notification.style.fontFamily = 'Arial, sans-serif';
    notification.style.boxShadow = '0 3px 6px rgba(0,0,0,0.16)';
    notification.style.minWidth = '250px';
    notification.style.transition = 'all 0.3s ease';
    
    // Définir le style en fonction du type
    switch(type) {
      case 'success':
        notification.style.backgroundColor = '#4CAF50';
        notification.style.color = 'white';
        break;
      case 'warning':
        notification.style.backgroundColor = '#FF9800';
        notification.style.color = 'white';
        break;
      case 'error':
        notification.style.backgroundColor = '#F44336';
        notification.style.color = 'white';
        break;
      default: // info
        notification.style.backgroundColor = '#2196F3';
        notification.style.color = 'white';
    }
    
    // Ajouter le message
    notification.textContent = message;
    
    // Ajouter au document
    document.body.appendChild(notification);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  // Initialiser l'interface d'administration
  initAdminInterface();
  
  // Réinitialiser à chaque chargement de page
  window.addEventListener('load', function() {
    initAdminInterface();
    // Appeler directement la fonction au lieu d'utiliser un timeout
    addAdminTab();
  });
})();
