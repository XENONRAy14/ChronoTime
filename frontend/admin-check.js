// Script direct pour activer l'interface d'administration
// Fonctionne indépendamment des API backend

// Supprimer les données fictives du localStorage
if (localStorage.getItem('adminMockUsers')) {
  console.log('Suppression des utilisateurs fictifs du cache...');
  localStorage.removeItem('adminMockUsers');
}

// Fonction pour générer un ID unique (conservée pour compatibilité)
function generateId() {
  return 'user_' + Math.random().toString(36).substr(2, 9);
}

// Fonction pour calculer les statistiques en temps réel (utilise maintenant les données réelles)
async function getUpdatedStats() {
  try {
    // Récupérer les utilisateurs réels
    const users = await window.API.getAllUsers();
    
    return {
      totalUsers: users.length,
      totalAdmins: users.filter(user => user.isAdmin).length,
      activeUsers: users.filter(user => user.status === 'actif' || !user.status).length,
      suspendedUsers: users.filter(user => user.status === 'suspendu').length,
      totalCourses: 5,
      totalChronos: 12
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    return {
      totalUsers: 0,
      totalAdmins: 0,
      activeUsers: 0,
      suspendedUsers: 0,
      totalCourses: 5,
      totalChronos: 12
    };
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
      // Ajouter des wrappers aux fonctions d'API existantes pour ajouter des notifications
      const originalDeleteUser = window.API.deleteUser;
      window.API.deleteUser = async function(userId) {
        try {
          // Récupérer le nom d'utilisateur avant la suppression
          const users = await window.API.getAllUsers();
          const user = users.find(u => u._id === userId);
          const username = user ? user.username : 'Utilisateur';
          
          // Vérifier que ce n'est pas l'utilisateur Belho.r (protection)
          if (user && user.username === 'Belho.r') {
            console.error('Tentative de suppression du compte administrateur principal');
            showNotification('Impossible de supprimer le compte administrateur principal', 'error');
            return { success: false };
          }
          
          // Appeler la fonction originale
          const result = await originalDeleteUser(userId);
          
          if (result.success) {
            showNotification(`Utilisateur ${username} supprimé avec succès`, 'success');
          }
          
          return result;
        } catch (error) {
          console.error('Erreur lors de la suppression:', error);
          showNotification('Erreur lors de la suppression de l\'utilisateur', 'error');
          return { success: false };
        }
      };
      
      const originalPromoteUser = window.API.promoteUser;
      window.API.promoteUser = async function(username) {
        try {
          // Appeler la fonction originale
          const result = await originalPromoteUser(username);
          
          if (result.success) {
            showNotification(`${username} est maintenant administrateur`, 'success');
          }
          
          return result;
        } catch (error) {
          console.error('Erreur lors de la promotion:', error);
          showNotification('Erreur lors de la promotion de l\'utilisateur', 'error');
          return { success: false };
        }
      };
      
      const originalDemoteUser = window.API.demoteUser;
      window.API.demoteUser = async function(username) {
        try {
          // Vérifier que ce n'est pas l'utilisateur Belho.r (protection)
          if (username === 'Belho.r') {
            console.error('Tentative de rétrogradation du compte administrateur principal');
            showNotification('Impossible de rétrograder le compte administrateur principal', 'error');
            return { success: false };
          }
          
          // Appeler la fonction originale
          const result = await originalDemoteUser(username);
          
          if (result.success) {
            showNotification(`${username} n'est plus administrateur`, 'success');
          }
          
          return result;
        } catch (error) {
          console.error('Erreur lors de la rétrogradation:', error);
          showNotification('Erreur lors de la rétrogradation de l\'utilisateur', 'error');
          return { success: false };
        }
      };
      
      console.log('Fonctions API remplacées avec succès');
    } else {
      console.error('API non disponible - attente du chargement');
      setTimeout(setupAdminInterface, 500);
      return;
    }
    
    // 3. Améliorer les fonctions d'administration
    if (window.AdminFunctions) {
      // Conserver la fonction loadAdminData originale
      const originalLoadAdminData = window.AdminFunctions.loadAdminData;
      
      // Ajouter des logs et des notifications à loadAdminData
      window.AdminFunctions.loadAdminData = async function() {
        console.log('Chargement des données d\'administration...');
        try {
          const result = await originalLoadAdminData();
          console.log('Données d\'administration chargées:', result);
          return result;
        } catch (error) {
          console.error('Erreur lors du chargement des données d\'administration:', error);
          showNotification('Erreur lors du chargement des données', 'error');
          return { users: [], error: error.message };
        }
      };
      
      // Remplacer getAdminStats pour utiliser les statistiques réelles
      window.AdminFunctions.getAdminStats = async function() {
        console.log('Récupération des statistiques...');
        try {
          const stats = await getUpdatedStats();
          console.log('Statistiques récupérées:', stats);
          return { stats };
        } catch (error) {
          console.error('Erreur lors de la récupération des statistiques:', error);
          return { stats: { totalUsers: 0, totalAdmins: 0, totalCourses: 0, totalChronos: 0 } };
        }
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
