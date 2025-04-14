// Script temporaire pour vérifier et corriger le statut d'administrateur
// Ce script doit être inclus temporairement dans index.html et supprimé après utilisation

(function() {
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
  
  // Exécuter la vérification après le chargement de la page
  window.addEventListener('load', checkAdminStatus);
})();
