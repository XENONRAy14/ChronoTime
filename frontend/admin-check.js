// Script direct pour activer l'interface d'administration
// Fonctionne indépendamment des API backend

// Données utilisateurs fictives - Utilise localStorage pour persister les modifications
let mockUsers = JSON.parse(localStorage.getItem('adminMockUsers')) || [
  {
    _id: "67fb16047f01ff280bd3381e",
    username: "Belho.r",
    email: "rayanbelho@hotmail.com",
    name: "Rayan BELHOCINE",
    isAdmin: true,
    createdAt: "2025-04-13T13:52:30.220Z",
    lastLogin: "2025-04-14T03:45:12.000Z",
    status: "actif"
  },
  {
    _id: "67fb16047f01ff280bd3381f",
    username: "TestUser",
    email: "test@example.com",
    name: "Utilisateur Test",
    isAdmin: false,
    createdAt: "2025-04-13T14:30:00.000Z",
    lastLogin: "2025-04-13T18:22:05.000Z",
    status: "actif"
  },
  {
    _id: "67fb16047f01ff280bd3382a",
    username: "AmiUtilisateur",
    email: "ami@example.com",
    name: "Votre Ami",
    isAdmin: false,
    createdAt: "2025-04-13T15:45:00.000Z",
    lastLogin: "2025-04-14T02:10:45.000Z",
    status: "actif"
  }
];

// Fonction pour générer un ID unique
function generateId() {
  return 'user_' + Math.random().toString(36).substr(2, 9);
}

// Fonction pour sauvegarder les modifications des utilisateurs
function saveMockUsers() {
  localStorage.setItem('adminMockUsers', JSON.stringify(mockUsers));
}

// Fonction pour calculer les statistiques en temps réel
function getUpdatedStats() {
  return {
    totalUsers: mockUsers.length,
    totalAdmins: mockUsers.filter(user => user.isAdmin).length,
    activeUsers: mockUsers.filter(user => user.status === 'actif').length,
    suspendedUsers: mockUsers.filter(user => user.status === 'suspendu').length,
    totalCourses: 5,
    totalChronos: 12
  };
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

// Fonction principale exécutée immédiatement
(function() {
  console.log('Admin Direct Fix v4.0 - Chargement avec persistance...');
  
  // Fonction pour activer l'interface d'administration
  function setupAdminInterface() {
    // 1. Activer le statut d'administrateur pour l'utilisateur connecté
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      user.isAdmin = true;
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Statut administrateur activé:', user);
    }
    
    // 2. Remplacer les fonctions d'API directement
    if (window.API) {
      // Remplacer les fonctions d'API
      window.API.getAllUsers = function() {
        console.log('Retour des utilisateurs fictifs');
        return Promise.resolve(mockUsers);
      };
      
      window.API.deleteUser = function(userId) {
        console.log('Simulation de suppression:', userId);
        // Trouver et supprimer l'utilisateur
        const userIndex = mockUsers.findIndex(user => user._id === userId);
        if (userIndex !== -1) {
          // Vérifier que ce n'est pas l'utilisateur Belho.r (protection)
          if (mockUsers[userIndex].username === 'Belho.r') {
            console.error('Tentative de suppression du compte administrateur principal');
            return Promise.resolve({ 
              success: false, 
              message: 'Impossible de supprimer le compte administrateur principal' 
            });
          }
          
          // Supprimer l'utilisateur
          const deletedUser = mockUsers.splice(userIndex, 1)[0];
          saveMockUsers(); // Sauvegarder les modifications
          console.log('Utilisateur supprimé:', deletedUser.username);
          
          // Notification de succès
          showNotification(`Utilisateur ${deletedUser.username} supprimé avec succès`, 'success');
        }
        return Promise.resolve({ success: true });
      };
      
      window.API.promoteUser = function(username) {
        console.log('Simulation de promotion:', username);
        // Trouver et promouvoir l'utilisateur
        const user = mockUsers.find(user => user.username === username);
        if (user) {
          user.isAdmin = true;
          user.lastModified = new Date().toISOString();
          saveMockUsers(); // Sauvegarder les modifications
          console.log('Utilisateur promu:', username);
          
          // Notification de succès
          showNotification(`${username} est maintenant administrateur`, 'success');
        }
        return Promise.resolve({ success: true });
      };
      
      window.API.demoteUser = function(username) {
        console.log('Simulation de rétrogradation:', username);
        // Trouver et rétrograder l'utilisateur
        const user = mockUsers.find(user => user.username === username);
        if (user) {
          // Vérifier que ce n'est pas l'utilisateur Belho.r (protection)
          if (user.username === 'Belho.r') {
            console.error('Tentative de rétrogradation du compte administrateur principal');
            return Promise.resolve({ 
              success: false, 
              message: 'Impossible de rétrograder le compte administrateur principal' 
            });
          }
          
          user.isAdmin = false;
          user.lastModified = new Date().toISOString();
          saveMockUsers(); // Sauvegarder les modifications
          console.log('Utilisateur rétrogradé:', username);
          
          // Notification de succès
          showNotification(`${username} n'est plus administrateur`, 'success');
        }
        return Promise.resolve({ success: true });
      };
      
      // Fonction pour suspendre un utilisateur
      window.API.suspendUser = function(userId) {
        const user = mockUsers.find(user => user._id === userId);
        if (user) {
          // Vérifier que ce n'est pas l'utilisateur Belho.r (protection)
          if (user.username === 'Belho.r') {
            return Promise.resolve({ 
              success: false, 
              message: 'Impossible de suspendre le compte administrateur principal' 
            });
          }
          
          user.status = 'suspendu';
          user.lastModified = new Date().toISOString();
          saveMockUsers();
          console.log('Utilisateur suspendu:', user.username);
          
          // Notification de succès
          showNotification(`Compte de ${user.username} suspendu`, 'warning');
        }
        return Promise.resolve({ success: true });
      };
      
      // Fonction pour réactiver un utilisateur
      window.API.reactivateUser = function(userId) {
        const user = mockUsers.find(user => user._id === userId);
        if (user) {
          user.status = 'actif';
          user.lastModified = new Date().toISOString();
          saveMockUsers();
          console.log('Utilisateur réactivé:', user.username);
          
          // Notification de succès
          showNotification(`Compte de ${user.username} réactivé`, 'success');
        }
        return Promise.resolve({ success: true });
      };
      
      console.log('Fonctions API remplacées avec succès');
    } else {
      console.error('API non disponible - attente du chargement');
      setTimeout(setupAdminInterface, 500);
      return;
    }
    
    // 3. Remplacer les fonctions d'administration
    if (window.AdminFunctions) {
      window.AdminFunctions.loadAdminData = function() {
        console.log('Chargement des données d\'administration');
        return Promise.resolve({ users: mockUsers, error: null });
      };
      
      window.AdminFunctions.getAdminStats = function() {
        console.log('Récupération des statistiques');
        return Promise.resolve({ stats: getUpdatedStats() });
      };
      
      console.log('Fonctions d\'administration remplacées avec succès');
      
      // Afficher un message de confirmation
      const adminMessage = document.createElement('div');
      adminMessage.style.position = 'fixed';
      adminMessage.style.top = '10px';
      adminMessage.style.right = '10px';
      adminMessage.style.backgroundColor = '#4CAF50';
      adminMessage.style.color = 'white';
      adminMessage.style.padding = '10px';
      adminMessage.style.borderRadius = '5px';
      adminMessage.style.zIndex = '9999';
      adminMessage.style.fontFamily = 'Arial, sans-serif';
      adminMessage.textContent = 'Interface d\'administration activée avec persistance!';
      document.body.appendChild(adminMessage);
      
      // Supprimer le message après 5 secondes
      setTimeout(() => {
        adminMessage.remove();
      }, 5000);
    } else {
      console.error('AdminFunctions non disponible - attente du chargement');
      setTimeout(setupAdminInterface, 500);
    }
  }
  
  // Exécuter immédiatement et à nouveau après le chargement complet
  setupAdminInterface();
  window.addEventListener('load', setupAdminInterface);
})();
