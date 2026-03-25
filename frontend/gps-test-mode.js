// 🧪 MODE TEST GPS - Pour tester les courses depuis chez soi
// Ce fichier permet de simuler une course complète sans bouger

class GPSTestMode {
  constructor() {
    this.isActive = false;
    this.testPhase = null; // 'start', 'running', 'end'
    this.simulatedPosition = null;
    this.intervalId = null;
    this.courseData = null;
  }

  // Activer le mode test
  activate(courseData) {
    console.log('🧪 MODE TEST ACTIVÉ');
    this.isActive = true;
    this.courseData = courseData;
    this.testPhase = 'idle';
    this.showTestControls();
    
    // Déclencher automatiquement le démarrage du suivi GPS
    console.log('🚀 Démarrage automatique du suivi GPS en mode test...');
    
    // Attendre un peu que le panneau s'affiche
    setTimeout(() => {
      // Trouver et cliquer sur le bouton "Démarrer le suivi GPS"
      const startButton = document.querySelector('button[type="button"]');
      if (startButton && startButton.textContent.includes('Démarrer le suivi GPS')) {
        console.log('✅ Clic automatique sur "Démarrer le suivi GPS"');
        startButton.click();
      }
    }, 500);
  }

  // Désactiver le mode test
  deactivate() {
    console.log('🧪 MODE TEST DÉSACTIVÉ');
    this.isActive = false;
    this.testPhase = null;
    this.simulatedPosition = null;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.hideTestControls();
  }

  // Simuler la position au point de départ
  simulateStart() {
    if (!this.courseData || !this.courseData.tracePath || this.courseData.tracePath.length < 2) {
      console.error('❌ Pas de tracé disponible pour le test');
      return;
    }

    const startPoint = this.courseData.tracePath[0];
    this.testPhase = 'start';
    this.simulatedPosition = {
      coords: {
        latitude: startPoint.lat,
        longitude: startPoint.lng,
        accuracy: 10, // Précision GPS excellente en test
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      },
      timestamp: Date.now()
    };

    console.log('🎯 SIMULATION: Position au départ', this.simulatedPosition);
  }

  // Simuler le déplacement vers l'arrivée
  simulateRunning() {
    if (!this.courseData || !this.courseData.tracePath || this.courseData.tracePath.length < 2) {
      return;
    }

    const tracePath = this.courseData.tracePath;
    let currentIndex = 0;

    this.testPhase = 'running';

    // Simuler le déplacement le long du tracé
    this.intervalId = setInterval(() => {
      currentIndex++;
      
      if (currentIndex >= tracePath.length - 1) {
        // Arrivé à la fin, simuler l'arrivée
        this.simulateEnd();
        return;
      }

      const currentPoint = tracePath[currentIndex];
      this.simulatedPosition = {
        coords: {
          latitude: currentPoint.lat,
          longitude: currentPoint.lng,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: 15 // 15 m/s = 54 km/h
        },
        timestamp: Date.now()
      };

      console.log(`🏃 SIMULATION: Point ${currentIndex}/${tracePath.length}`, this.simulatedPosition);
    }, 2000); // Un point toutes les 2 secondes
  }

  // Simuler l'arrivée
  simulateEnd() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (!this.courseData || !this.courseData.tracePath || this.courseData.tracePath.length < 2) {
      return;
    }

    const endPoint = this.courseData.tracePath[this.courseData.tracePath.length - 1];
    this.testPhase = 'end';
    this.simulatedPosition = {
      coords: {
        latitude: endPoint.lat,
        longitude: endPoint.lng,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: 0
      },
      timestamp: Date.now()
    };

    console.log('🏁 SIMULATION: Position à l\'arrivée', this.simulatedPosition);
  }

  // Obtenir la position simulée
  getCurrentPosition(successCallback, errorCallback) {
    if (!this.isActive || !this.simulatedPosition) {
      // Mode test inactif, utiliser le GPS réel
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
      return;
    }

    // Retourner la position simulée
    console.log('📍 Retour position simulée:', this.simulatedPosition);
    successCallback(this.simulatedPosition);
  }

  // Surveiller la position (version simulée)
  watchPosition(successCallback, errorCallback, options) {
    if (!this.isActive) {
      // Mode test inactif, utiliser le GPS réel
      return navigator.geolocation.watchPosition(successCallback, errorCallback, options);
    }

    // En mode test, appeler le callback avec la position simulée toutes les secondes
    const watchId = setInterval(() => {
      if (this.simulatedPosition) {
        console.log('📍 Watch position simulée:', this.simulatedPosition);
        successCallback(this.simulatedPosition);
      }
    }, 1000);

    return watchId;
  }

  // Arrêter la surveillance
  clearWatch(watchId) {
    if (watchId) {
      clearInterval(watchId);
    }
  }

  // Afficher les contrôles de test
  showTestControls() {
    // Vérifier si les contrôles existent déjà
    if (document.getElementById('gps-test-controls')) {
      return;
    }

    const controls = document.createElement('div');
    controls.id = 'gps-test-controls';
    controls.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 15px;
      border-radius: 10px;
      border: 2px solid #ff0000;
      z-index: 10000;
      font-family: monospace;
      box-shadow: 0 4px 20px rgba(255, 0, 0, 0.5);
    `;

    controls.innerHTML = `
      <div style="margin-bottom: 10px; font-weight: bold; color: #ff0000; font-size: 16px;">
        🧪 MODE TEST GPS
      </div>
      <div style="margin-bottom: 10px; color: #00ff00; font-size: 12px;">
        ✅ Suivi GPS activé automatiquement
      </div>
      <div style="margin-bottom: 10px; color: #ffff00; font-size: 11px;">
        Cliquez sur les boutons dans l'ordre :
      </div>
      <button id="test-simulate-start" style="
        background: #00ff00;
        color: black;
        border: none;
        padding: 10px 15px;
        margin: 5px 0;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        width: 100%;
        font-size: 14px;
      ">1️⃣ 🎯 DÉPART - Démarrer le chrono</button>
      <button id="test-simulate-end" style="
        background: #ff0000;
        color: white;
        border: none;
        padding: 10px 15px;
        margin: 5px 0;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        width: 100%;
        font-size: 14px;
      ">2️⃣ 🏁 ARRIVÉE - Arrêter le chrono</button>
      <hr style="border: 1px solid #666; margin: 10px 0;">
      <button id="test-deactivate" style="
        background: #666;
        color: white;
        border: none;
        padding: 8px 12px;
        margin: 5px 0;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        width: 100%;
      ">❌ Désactiver le mode test</button>
    `;

    document.body.appendChild(controls);

    // Ajouter les événements
    document.getElementById('test-simulate-start').addEventListener('click', () => {
      this.simulateStart();
    });

    document.getElementById('test-simulate-end').addEventListener('click', () => {
      this.simulateEnd();
    });

    document.getElementById('test-deactivate').addEventListener('click', () => {
      this.deactivate();
    });
  }

  // Masquer les contrôles de test
  hideTestControls() {
    const controls = document.getElementById('gps-test-controls');
    if (controls) {
      controls.remove();
    }
  }
}

// Créer une instance globale
window.GPSTestMode = new GPSTestMode();

console.log('🧪 Système de test GPS chargé - Utilisez window.GPSTestMode pour tester');
