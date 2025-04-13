// Script pour mettre à jour le statut d'administrateur de l'utilisateur connecté
(function() {
  // Vérifier si l'utilisateur est connecté
  const userString = localStorage.getItem('user');
  if (!userString) {
    console.error('Aucun utilisateur connecté. Veuillez vous connecter d\'abord.');
    alert('Veuillez vous connecter pour activer les fonctionnalités d\'administration.');
    return;
  }
  
  // Récupérer les informations utilisateur
  const user = JSON.parse(userString);
  console.log('Utilisateur actuel:', user);
  
  // Mettre à jour le statut d'administrateur
  user.isAdmin = true;
  
  // Enregistrer les modifications
  localStorage.setItem('user', JSON.stringify(user));
  console.log('Statut administrateur mis à jour:', user);
  
  // Rafraîchir la page pour appliquer les modifications
  alert('Statut administrateur mis à jour. La page va être rechargée.');
  window.location.reload();
})();
