// Fonctions d'administration pour l'application ChronoMontagne

// Charger les données d'administration
async function loadAdminData() {
  try {
    // Charger la liste des utilisateurs
    const usersData = await window.API.getAllUsers();
    if (usersData) {
      return { users: usersData, error: null };
    }
    
    return { users: [], error: "Aucun utilisateur trouvé" };
  } catch (error) {
    console.error('Erreur lors du chargement des données d\'administration:', error);
    return { users: [], error: "Erreur lors du chargement des données" };
  }
}

// Supprimer un utilisateur
async function deleteUser(userId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur et toutes ses données ? Cette action est irréversible.')) {
    return { success: false, message: "Opération annulée" };
  }
  
  try {
    await window.API.deleteUser(userId);
    return { success: true, message: "Utilisateur supprimé avec succès" };
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return { success: false, message: "Erreur lors de la suppression de l'utilisateur" };
  }
}

// Promouvoir un utilisateur en administrateur
async function promoteUser(userId) {
  try {
    await window.API.promoteUser(userId);
    return { success: true, message: "Utilisateur promu administrateur avec succès" };
  } catch (error) {
    console.error('Erreur lors de la promotion de l\'utilisateur:', error);
    return { success: false, message: "Erreur lors de la promotion de l'utilisateur" };
  }
}

// Rétrograder un administrateur
async function demoteUser(userId) {
  try {
    await window.API.demoteUser(userId);
    return { success: true, message: "Administrateur rétrogradé avec succès" };
  } catch (error) {
    console.error('Erreur lors de la rétrogradation de l\'administrateur:', error);
    return { success: false, message: "Erreur lors de la rétrogradation de l'administrateur" };
  }
}

// Obtenir des statistiques sur les utilisateurs
async function getAdminStats() {
  try {
    const statsData = await window.API.getAdminStats();
    if (statsData) {
      return { stats: statsData, error: null };
    }
    
    return { stats: null, error: "Aucune statistique disponible" };
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error);
    return { stats: null, error: "Erreur lors du chargement des statistiques" };
  }
}

// Exporter les fonctions d'administration
window.AdminFunctions = {
  loadAdminData,
  deleteUser,
  promoteUser,
  demoteUser,
  getAdminStats
};
