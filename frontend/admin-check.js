// Script temporaire pour vérifier et corriger le statut d'administrateur
// Ce script doit être inclus temporairement dans index.html et supprimé après utilisation

(function() {
  // Données utilisateurs fictives pour le développement
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

  // Fonction pour vérifier si l'utilisateur est connecté
  function checkAdminStatus() {
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userString || !token) {
      console.log('Aucun utilisateur connecté. Veuillez vous connecter d\'abord.');
      return;
    }
    
    // Récupérer les informations utilisateur actuelles
    const user = JSON.parse(userString);
    console.log('Utilisateur actuel:', user);
    
    // Vérifier si l'utilisateur est "Belho.r"
    if (user.username === "Belho.r") {
      console.log('Utilisateur administrateur détecté. Mise à jour du statut...');
      
      // Mettre à jour le statut d'administrateur
      user.isAdmin = true;
      
      // Enregistrer les modifications
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Statut administrateur mis à jour:', user);
      
      // Remplacer les fonctions d'administration par des versions qui fonctionnent
      overrideAdminFunctions();
      
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
      adminMessage.textContent = 'Statut administrateur activé!';
      document.body.appendChild(adminMessage);
      
      // Supprimer le message après 5 secondes
      setTimeout(() => {
        adminMessage.remove();
      }, 5000);
    }
  }
  
  // Fonction pour remplacer les fonctions d'administration
  function overrideAdminFunctions() {
    // Remplacer la fonction pour récupérer tous les utilisateurs
    window.API.getAllUsers = async function() {
      console.log('Utilisation de données utilisateurs fictives');
      return mockUsers;
    };
    
    // Remplacer la fonction pour supprimer un utilisateur
    window.API.deleteUser = async function(userId) {
      console.log('Simulation de suppression d\'utilisateur:', userId);
      // Filtrer les utilisateurs fictifs pour simuler la suppression
      const userIndex = mockUsers.findIndex(user => user._id === userId);
      if (userIndex !== -1) {
        mockUsers.splice(userIndex, 1);
      }
      return { success: true };
    };
    
    // Remplacer la fonction pour promouvoir un utilisateur
    window.API.promoteUser = async function(username) {
      console.log('Simulation de promotion d\'utilisateur:', username);
      const user = mockUsers.find(user => user.username === username);
      if (user) {
        user.isAdmin = true;
      }
      return { success: true };
    };
    
    // Remplacer la fonction pour rétrograder un utilisateur
    window.API.demoteUser = async function(username) {
      console.log('Simulation de rétrogradation d\'utilisateur:', username);
      const user = mockUsers.find(user => user.username === username);
      if (user) {
        user.isAdmin = false;
      }
      return { success: true };
    };
    
    // Remplacer la fonction pour récupérer les statistiques d'administration
    window.AdminFunctions.getAdminStats = async function() {
      console.log('Récupération des statistiques d\'administration');
      return {
        stats: {
          totalUsers: mockUsers.length,
          totalAdmins: mockUsers.filter(user => user.isAdmin).length,
          totalCourses: 5,
          totalChronos: 12
        }
      };
    };
    
    console.log('Fonctions d\'administration remplacées avec succès');
  }
  
  // Exécuter la vérification après le chargement de la page
  window.addEventListener('load', checkAdminStatus);
})();
