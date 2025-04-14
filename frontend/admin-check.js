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
    createdAt: "2025-04-13T13:52:30.220Z"
  },
  {
    _id: "67fb16047f01ff280bd3381f",
    username: "TestUser",
    email: "test@example.com",
    name: "Utilisateur Test",
    isAdmin: false,
    createdAt: "2025-04-13T14:30:00.000Z"
  },
  {
    _id: "67fb16047f01ff280bd3382a",
    username: "AmiUtilisateur",
    email: "ami@example.com",
    name: "Votre Ami",
    isAdmin: false,
    createdAt: "2025-04-13T15:45:00.000Z"
  }
];

// Fonction pour sauvegarder les modifications des utilisateurs
function saveMockUsers() {
  localStorage.setItem('adminMockUsers', JSON.stringify(mockUsers));
}

// Fonction pour calculer les statistiques en temps réel
function getUpdatedStats() {
  return {
    totalUsers: mockUsers.length,
    totalAdmins: mockUsers.filter(user => user.isAdmin).length,
    totalCourses: 5,
    totalChronos: 12
  };
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
          mockUsers.splice(userIndex, 1);
          saveMockUsers(); // Sauvegarder les modifications
          console.log('Utilisateur supprimé:', userId);
        }
        return Promise.resolve({ success: true });
      };
      
      window.API.promoteUser = function(username) {
        console.log('Simulation de promotion:', username);
        // Trouver et promouvoir l'utilisateur
        const user = mockUsers.find(user => user.username === username);
        if (user) {
          user.isAdmin = true;
          saveMockUsers(); // Sauvegarder les modifications
          console.log('Utilisateur promu:', username);
        }
        return Promise.resolve({ success: true });
      };
      
      window.API.demoteUser = function(username) {
        console.log('Simulation de rétrogradation:', username);
        // Trouver et rétrograder l'utilisateur
        const user = mockUsers.find(user => user.username === username);
        if (user) {
          user.isAdmin = false;
          saveMockUsers(); // Sauvegarder les modifications
          console.log('Utilisateur rétrogradé:', username);
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
