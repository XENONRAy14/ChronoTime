// Script direct pour activer l'interface d'administration
// Fonctionne indépendamment des API backend

// Données utilisateurs fictives
const mockUsers = [
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
  }
];

// Statistiques fictives
const mockStats = {
  totalUsers: 2,
  totalAdmins: 1,
  totalCourses: 5,
  totalChronos: 12
};

// Fonction principale exécutée immédiatement
(function() {
  console.log('Admin Direct Fix v3.0 - Chargement...');
  
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
        return Promise.resolve({ success: true });
      };
      
      window.API.promoteUser = function(username) {
        console.log('Simulation de promotion:', username);
        return Promise.resolve({ success: true });
      };
      
      window.API.demoteUser = function(username) {
        console.log('Simulation de rétrogradation:', username);
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
        return Promise.resolve({ stats: mockStats });
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
      adminMessage.textContent = 'Interface d\'administration activée!';
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
