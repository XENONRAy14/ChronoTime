// Simulateur GPS désactivé pour éviter les requêtes automatiques inutiles
// Version simplifiée qui ne fait rien mais préserve l'API

class GPSSimulator {
  constructor() {
    this.isActive = false;
    console.log("Simulateur GPS désactivé pour éviter les requêtes automatiques");
  }

  // Méthode d'initialisation qui ne fait rien
  init() {
    console.log("Simulateur GPS désactivé - Utilisation de la géolocalisation réelle");
    return;
  }
  
  // Méthodes simplifiées qui ne font rien
  startSimulation() {
    console.log("Simulateur GPS désactivé - La simulation ne démarrera pas");
    return;
  }
  
  stopSimulation() {
    return;
  }
  
  setRoute(route) {
    return;
  }
  
  setSpeed(speed) {
    return;
  }
  
  // Utiliser la géolocalisation réelle du navigateur
  getCurrentPosition(success, error, options) {
    navigator.geolocation.getCurrentPosition(success, error, options);
  }
  
  watchPosition(success, error, options) {
    return navigator.geolocation.watchPosition(success, error, options);
  }
  
  clearWatch(id) {
    navigator.geolocation.clearWatch(id);
  }
}

// Initialisation désactivée pour éviter les requêtes automatiques
document.addEventListener('DOMContentLoaded', () => {
  console.log("Le simulateur GPS est désactivé pour éviter les requêtes automatiques");
  
  // Créer une instance vide du simulateur pour éviter les erreurs
  window.GPSSimulator = new GPSSimulator();
  
  // Interface désactivée pour éviter les requêtes automatiques
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'simulator-controls';
  controlsContainer.style.display = 'none'; // Cacher les contrôles
});
