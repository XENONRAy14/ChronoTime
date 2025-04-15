// Version désactivée du simulateur GPS - Fonctionnalité retirée
class GPSSimulator {
  constructor() {
    this.isActive = false;
    this.watchCallbacks = [];
    this.currentRoute = [];
    this.currentIndex = 0;
    this.simulationSpeed = 1;
    this.simulationInterval = null;
    this.originalGeolocation = null;
    this.simulateExactPosition = false;
    this.testPhase = null;
    console.log("Simulateur GPS désactivé");
  }

  // Initialiser le simulateur (désactivé)
  init() {
    console.log("Simulateur GPS désactivé - Utilisation de la géolocalisation réelle");
    
    // Ne pas intercepter les méthodes de géolocalisation
    this.originalGetCurrentPosition = navigator.geolocation.getCurrentPosition;
    this.originalWatchPosition = navigator.geolocation.watchPosition;
    this.originalClearWatch = navigator.geolocation.clearWatch;
    
    // Remplacer les méthodes par nos versions
    navigator.geolocation.getCurrentPosition = this.getCurrentPosition.bind(this);
    navigator.geolocation.watchPosition = this.watchPosition.bind(this);
    navigator.geolocation.clearWatch = this.clearWatch.bind(this);
  }

  // Restaurer la géolocalisation originale
  restore() {
    // Restaurer les méthodes originales
    if (this.originalGetCurrentPosition) {
      navigator.geolocation.getCurrentPosition = this.originalGetCurrentPosition;
      this.originalGetCurrentPosition = null;
    }
    if (this.originalWatchPosition) {
      navigator.geolocation.watchPosition = this.originalWatchPosition;
      this.originalWatchPosition = null;
    }
    if (this.originalClearWatch) {
      navigator.geolocation.clearWatch = this.originalClearWatch;
      this.originalClearWatch = null;
    }
    this.stopSimulation();
  }

  // Définir l'itinéraire à simuler
  setRoute(route) {
    this.currentRoute = route;
    this.currentIndex = 0;
    console.log(`Itinéraire défini avec ${route.length} points`);
  }

  // Définir la vitesse de simulation
  setSpeed(speed) {
    this.simulationSpeed = speed;
    console.log(`Vitesse de simulation définie à ${speed}x`);
  }

  // Obtenir la position actuelle (pour getCurrentPosition)
  getCurrentPosition(successCallback, errorCallback, options) {
    // Si le simulateur n'est pas actif, utiliser la méthode originale
    if (!this.isActive || this.currentRoute.length === 0) {
      if (this.originalGetCurrentPosition) {
        return this.originalGetCurrentPosition.call(navigator.geolocation, successCallback, errorCallback, options);
      } else {
        if (errorCallback) {
          errorCallback({
            code: 2,
            message: "Simulateur GPS non actif ou aucun itinéraire défini"
          });
        }
      }
      return;
    }

    // En mode test, renvoyer exactement les coordonnées du point de départ ou d'arrivée
    let position;
    
    if (this.simulateExactPosition) {
      // Si nous sommes en mode test, utiliser les points exacts
      if (!this.testPhase || this.testPhase === 'start') {
        // Phase 1: Simuler la position au point de départ
        position = {
          coords: {
            latitude: this.currentRoute[0].lat,
            longitude: this.currentRoute[0].lng,
            altitude: 0,
            accuracy: 5,
            altitudeAccuracy: null,
            heading: null,
            speed: 0
          },
          timestamp: Date.now()
        };
        
        // Après un court délai, passer à la phase 2
        if (!this.testPhase) {
          this.testPhase = 'start';
          setTimeout(() => {
            this.testPhase = 'moving';
            console.log("Simulation: Déplacement en cours...");
          }, 2000);
        }
      } else if (this.testPhase === 'moving') {
        // Phase 2: Simuler le déplacement
        const currentPoint = this.currentRoute[this.currentIndex];
        position = {
          coords: {
            latitude: currentPoint.lat,
            longitude: currentPoint.lng,
            altitude: 0,
            accuracy: 10,
            altitudeAccuracy: null,
            heading: null,
            speed: 15 * this.simulationSpeed // Vitesse simulée en m/s
          },
          timestamp: Date.now()
        };
        
        // Si nous sommes presque à la fin, passer à la phase 3
        if (this.currentIndex >= this.currentRoute.length - 3) {
          this.testPhase = 'end';
          console.log("Simulation: Arrivée imminente...");
        }
      } else if (this.testPhase === 'end') {
        // Phase 3: Simuler la position au point d'arrivée
        const lastPoint = this.currentRoute[this.currentRoute.length - 1];
        position = {
          coords: {
            latitude: lastPoint.lat,
            longitude: lastPoint.lng,
            altitude: 0,
            accuracy: 5,
            altitudeAccuracy: null,
            heading: null,
            speed: 0
          },
          timestamp: Date.now()
        };
      }
    } else {
      // Mode normal: utiliser le point actuel
      const currentPoint = this.currentRoute[this.currentIndex];
      position = {
        coords: {
          latitude: currentPoint.lat,
          longitude: currentPoint.lng,
          altitude: 0,
          accuracy: 10,
          altitudeAccuracy: null,
          heading: null,
          speed: 10 * this.simulationSpeed // Vitesse simulée en m/s
        },
        timestamp: Date.now()
      };
    }
    
    if (successCallback) {
      successCallback(position);
    }
  }

  // Surveiller la position (pour watchPosition)
  watchPosition(successCallback, errorCallback, options) {
    // Si le simulateur n'est pas actif, utiliser la méthode originale
    if (!this.isActive || this.currentRoute.length === 0) {
      if (this.originalWatchPosition) {
        return this.originalWatchPosition.call(navigator.geolocation, successCallback, errorCallback, options);
      }
    }
    
    const watchId = Date.now();
    
    this.watchCallbacks.push({
      id: watchId,
      success: successCallback,
      error: errorCallback
    });
    
    // Si la simulation n'est pas déjà active, la démarrer
    if (!this.isActive) {
      this.startSimulation();
    }
    
    return watchId;
  }

  // Arrêter la surveillance (pour clearWatch)
  clearWatch(watchId) {
    // Vérifier si c'est un ID que nous avons généré
    const isOurWatchId = this.watchCallbacks.some(cb => cb.id === watchId);
    
    if (isOurWatchId) {
      this.watchCallbacks = this.watchCallbacks.filter(cb => cb.id !== watchId);
      
      // Si plus aucun callback, arrêter la simulation
      if (this.watchCallbacks.length === 0) {
        this.stopSimulation();
      }
    } else if (this.originalClearWatch) {
      // Si ce n'est pas notre ID, utiliser la méthode originale
      this.originalClearWatch.call(navigator.geolocation, watchId);
    }
  }

  // Démarrer la simulation
  startSimulation() {
    if (this.isActive || this.currentRoute.length === 0) return;
    
    this.isActive = true;
    // Commencer exactement au point de départ
    this.currentIndex = 0;
    
    // Mode test : simuler immédiatement la présence au point de départ
    this.simulateExactPosition = true;
    
    // Calculer l'intervalle entre les points en fonction de la vitesse
    const updateInterval = 1000 / this.simulationSpeed; // ms
    
    this.simulationInterval = setInterval(() => {
      // Si on a atteint la fin de l'itinéraire, revenir au début
      if (this.currentIndex >= this.currentRoute.length - 1) {
        // Rester sur le dernier point pendant quelques secondes avant de recommencer
        setTimeout(() => {
          this.currentIndex = 0;
        }, 3000);
      } else {
        this.currentIndex++;
      }
      
      const currentPoint = this.currentRoute[this.currentIndex];
      const nextPoint = this.currentRoute[Math.min(this.currentIndex + 1, this.currentRoute.length - 1)];
      
      // Calculer la vitesse simulée en fonction de la distance entre les points
      let speed = 10; // Vitesse par défaut en m/s
      
      if (currentPoint && nextPoint) {
        const distance = this.calculateDistance(
          currentPoint.lat, currentPoint.lng,
          nextPoint.lat, nextPoint.lng
        );
        
        // Ajuster la vitesse en fonction de la distance (pour simuler des accélérations/décélérations)
        if (distance > 0) {
          speed = distance / (updateInterval / 1000); // m/s
        }
      }
      
      // Notifier tous les callbacks
      this.watchCallbacks.forEach(cb => {
        if (cb.success) {
          cb.success({
            coords: {
              latitude: currentPoint.lat,
              longitude: currentPoint.lng,
              altitude: 0,
              accuracy: 10,
              altitudeAccuracy: null,
              heading: null,
              speed: speed * this.simulationSpeed
            },
            timestamp: Date.now()
          });
        }
      });
    }, updateInterval);
    
    console.log("Simulation GPS démarrée");
  }

  // Arrêter la simulation
  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    
    this.isActive = false;
    this.simulateExactPosition = false;
    this.testPhase = null;
    console.log("Simulation GPS arrêtée");
  }

  // Calculer la distance entre deux points GPS (en mètres)
  calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }
}

// Créer une instance globale du simulateur
window.GPSSimulator = new GPSSimulator();

// Initialiser le simulateur au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  console.log("Initialisation du simulateur GPS...");
  window.GPSSimulator.init();
  
  // Ajouter les contrôles du simulateur à l'interface
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'simulator-controls';
  controlsContainer.innerHTML = `
    <div class="simulator-header">
      <h3>Simulateur GPS</h3>
      <button id="toggle-simulator" class="toggle-button">Activer</button>
    </div>
    <div class="simulator-body">
      <div class="form-group">
        <label for="simulation-speed">Vitesse de simulation:</label>
        <select id="simulation-speed">
          <option value="0.5">0.5x (Lent)</option>
          <option value="1" selected>1x (Normal)</option>
          <option value="2">2x (Rapide)</option>
          <option value="5">5x (Très rapide)</option>
        </select>
      </div>
      <div class="simulator-status">
        <span id="simulator-status-text">Inactif</span>
      </div>
      <div class="simulator-actions">
        <button id="simulate-start" class="action-button">Simuler Départ</button>
        <button id="simulate-moving" class="action-button">Simuler Parcours</button>
        <button id="simulate-end" class="action-button">Simuler Arrivée</button>
      </div>
      <div class="simulator-info">
        <p>Le simulateur permet de tester l'application sans être sur le circuit.</p>
        <p><strong>Étapes:</strong></p>
        <ol>
          <li>Sélectionnez une course ci-dessus</li>
          <li>Cliquez sur "Activer" pour démarrer la simulation</li>
          <li>Utilisez les boutons pour simuler le départ, le parcours et l'arrivée</li>
        </ol>
      </div>
    </div>
  `;
  
  // Ajouter les contrôles à la page
  const chronoCard = document.querySelector('.card');
  if (chronoCard) {
    chronoCard.appendChild(controlsContainer);
  } else {
    document.body.appendChild(controlsContainer);
  }
  
  // Gérer les événements des contrôles
  const toggleButton = document.getElementById('toggle-simulator');
  const speedSelect = document.getElementById('simulation-speed');
  const statusText = document.getElementById('simulator-status-text');
  const simulateStartButton = document.getElementById('simulate-start');
  const simulateMovingButton = document.getElementById('simulate-moving');
  const simulateEndButton = document.getElementById('simulate-end');
  
  toggleButton.addEventListener('click', () => {
    if (window.GPSSimulator.isActive) {
      window.GPSSimulator.stopSimulation();
      toggleButton.textContent = 'Activer';
      toggleButton.classList.remove('active');
      statusText.textContent = 'Inactif';
    } else {
      // Vérifier si un itinéraire est défini
      if (!window.GPSSimulator.currentRoute || window.GPSSimulator.currentRoute.length === 0) {
        // Utiliser l'itinéraire de la course sélectionnée
        const selectedCourseId = document.querySelector('select[name="courseId"]')?.value;
        if (selectedCourseId) {
          const selectedCourse = window.courses?.find(c => c.id === selectedCourseId);
          if (selectedCourse && selectedCourse.tracePath && selectedCourse.tracePath.length > 0) {
            console.log("Utilisation du tracé de course défini:", selectedCourse.nom);
            window.GPSSimulator.setRoute(selectedCourse.tracePath);
            
            // Afficher un message de confirmation
            statusText.textContent = `Tracé de ${selectedCourse.nom} chargé`;
          } else {
            console.log("Aucun tracé défini pour cette course, utilisation d'un tracé de test");
            // Créer un itinéraire de test si aucun n'est disponible
            const testRoute = createTestRoute();
            window.GPSSimulator.setRoute(testRoute);
            
            // Afficher un message de confirmation
            statusText.textContent = "Tracé de test chargé";
          }
        } else {
          console.log("Aucune course sélectionnée, utilisation d'un tracé de test");
          // Créer un itinéraire de test si aucun n'est disponible
          const testRoute = createTestRoute();
          window.GPSSimulator.setRoute(testRoute);
          
          // Afficher un message de confirmation
          statusText.textContent = "Tracé de test chargé";
        }
      }
      
      // Simuler l'acceptation de la permission de géolocalisation
      const gpsButton = document.querySelector('button[data-action="request-gps"]');
      if (gpsButton) {
        setTimeout(() => {
          gpsButton.click();
        }, 500);
      }
      
      // Définir la vitesse de simulation
      const speed = parseFloat(speedSelect.value);
      window.GPSSimulator.setSpeed(speed);
      
      // Démarrer la simulation
      window.GPSSimulator.startSimulation();
      toggleButton.textContent = 'Désactiver';
      toggleButton.classList.add('active');
      statusText.textContent = 'Actif';
    }
  });
  
  speedSelect.addEventListener('change', () => {
    const speed = parseFloat(speedSelect.value);
    window.GPSSimulator.setSpeed(speed);
  });
  
  // Fonction pour créer un itinéraire de test
  function createTestRoute() {
    // Créer un itinéraire de test dans les Alpes-Maritimes (Col de Turini)
    const startLat = 43.9775;
    const startLng = 7.3906;
    
    // Créer un parcours en forme de boucle
    const route = [
      { lat: startLat, lng: startLng },                    // Point de départ
      { lat: startLat + 0.001, lng: startLng + 0.001 },    // Point 1
      { lat: startLat + 0.002, lng: startLng + 0.0015 },   // Point 2
      { lat: startLat + 0.003, lng: startLng + 0.001 },    // Point 3
      { lat: startLat + 0.004, lng: startLng - 0.001 },    // Point 4 (virage)
      { lat: startLat + 0.0035, lng: startLng - 0.002 },   // Point 5
      { lat: startLat + 0.002, lng: startLng - 0.0025 },   // Point 6
      { lat: startLat, lng: startLng - 0.002 },            // Point 7
      { lat: startLat - 0.001, lng: startLng - 0.001 },    // Point 8
      { lat: startLat - 0.0015, lng: startLng },           // Point 9
      { lat: startLat - 0.001, lng: startLng + 0.001 },    // Point 10
      { lat: startLat, lng: startLng + 0.0015 }            // Point d'arrivée (proche du départ)
    ];
    
    return route;
  }
  
  // Ajouter les gestionnaires d'événements pour les boutons d'action
  simulateStartButton.addEventListener('click', () => {
    if (window.GPSSimulator.isActive) {
      window.GPSSimulator.testPhase = 'start';
      statusText.textContent = 'Simulation: Départ';
      console.log('Simulation: Phase de départ activée');
    }
  });
  
  simulateMovingButton.addEventListener('click', () => {
    if (window.GPSSimulator.isActive) {
      window.GPSSimulator.testPhase = 'moving';
      statusText.textContent = 'Simulation: Parcours';
      console.log('Simulation: Phase de parcours activée');
    }
  });
  
  simulateEndButton.addEventListener('click', () => {
    if (window.GPSSimulator.isActive) {
      window.GPSSimulator.testPhase = 'end';
      statusText.textContent = 'Simulation: Arrivée';
      console.log('Simulation: Phase d\'arrivée activée');
    }
  });
  
  // Exposer les courses au simulateur - version optimisée
  // Au lieu de vérifier toutes les secondes, on vérifie une seule fois après 2 secondes
  // puis on utilise un MutationObserver pour détecter les changements
  setTimeout(() => {
    if (window.courses && window.courses.length > 0) {
      window.GPSSimulator.courses = window.courses;
    } else {
      // Fallback: vérifier une seule fois de plus après 5 secondes
      setTimeout(() => {
        if (window.courses && window.courses.length > 0) {
          window.GPSSimulator.courses = window.courses;
        }
      }, 5000);
    }
  }, 2000);
});

// Ajouter des styles pour les contrôles du simulateur
const style = document.createElement('style');
style.textContent = `
  .simulator-controls {
    margin-top: 20px;
    border: 2px solid #ff0000;
    border-radius: 8px;
    padding: 15px;
    background-color: rgba(0, 0, 0, 0.7);
    position: relative;
    z-index: 1000;
  }
  
  .simulator-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    border-bottom: 1px solid rgba(255, 0, 0, 0.3);
    padding-bottom: 10px;
  }
  
  .simulator-header h3 {
    margin: 0;
    color: #ff0000;
    font-size: 1.2rem;
  }
  
  .toggle-button {
    background-color: #333;
    color: #fff;
    border: 1px solid #ff0000;
    padding: 5px 15px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .toggle-button.active {
    background-color: #ff0000;
    color: #000;
  }
  
  .simulator-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .simulator-status {
    margin-top: 10px;
    padding: 8px;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 4px;
    text-align: center;
  }
  
  .simulator-info {
    margin-top: 15px;
    padding: 10px;
    background-color: rgba(255, 0, 0, 0.1);
    border-radius: 4px;
    font-size: 0.9rem;
  }
  
  .simulator-info p {
    margin: 5px 0;
  }
  
  .simulator-info ol {
    margin: 5px 0;
    padding-left: 20px;
  }
  
  .simulator-actions {
    display: flex;
    justify-content: space-between;
    margin: 15px 0;
  }
  
  .action-button {
    background-color: #333;
    color: #fff;
    border: 1px solid #ff0000;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .action-button:hover {
    background-color: #ff0000;
    color: #000;
  }
`;

document.head.appendChild(style);
