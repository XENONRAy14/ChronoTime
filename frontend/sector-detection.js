// 🏁 SYSTÈME DE DÉTECTION AUTOMATIQUE DES SECTEURS
// Détection intelligente des virages et génération automatique des secteurs

class SectorDetection {
  constructor() {
    this.minCornerAngle = 15; // Angle minimum pour détecter un virage (degrés)
    this.minCornerDistance = 100; // Distance minimum entre virages (mètres)
    this.sharpCornerThreshold = 45; // Seuil pour virage serré
  }

  // 📐 Calculer l'angle entre 3 points consécutifs
  calculateAngle(pointA, pointB, pointC) {
    // Vecteurs AB et BC
    const vectorAB = {
      x: pointB.lng - pointA.lng,
      y: pointB.lat - pointA.lat
    };
    
    const vectorBC = {
      x: pointC.lng - pointB.lng,
      y: pointC.lat - pointB.lat
    };
    
    // Produit scalaire et magnitudes
    const dotProduct = vectorAB.x * vectorBC.x + vectorAB.y * vectorBC.y;
    const magnitudeAB = Math.sqrt(vectorAB.x ** 2 + vectorAB.y ** 2);
    const magnitudeBC = Math.sqrt(vectorBC.x ** 2 + vectorBC.y ** 2);
    
    // Éviter la division par zéro
    if (magnitudeAB === 0 || magnitudeBC === 0) return 0;
    
    // Angle en radians puis degrés
    const cosAngle = Math.max(-1, Math.min(1, dotProduct / (magnitudeAB * magnitudeBC)));
    const angleRad = Math.acos(cosAngle);
    const angleDeg = angleRad * (180 / Math.PI);
    
    return 180 - angleDeg; // Angle de déviation
  }

  // 📏 Calculer la distance entre deux points GPS (formule de Haversine)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Rayon de la Terre en mètres
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // 🎯 Détecter les virages dans un tracé
  detectCorners(tracePath) {
    if (!tracePath || tracePath.length < 3) {
      console.warn('Tracé trop court pour détecter des virages');
      return [];
    }

    let corners = [];
    
    for (let i = 1; i < tracePath.length - 1; i++) {
      const angle = this.calculateAngle(
        tracePath[i - 1], 
        tracePath[i], 
        tracePath[i + 1]
      );
      
      // Si l'angle de déviation est significatif
      if (angle > this.minCornerAngle) {
        // Vérifier qu'on n'est pas trop proche du dernier virage
        const lastCorner = corners[corners.length - 1];
        const distanceFromLast = lastCorner ? 
          this.calculateDistance(
            tracePath[i].lat, tracePath[i].lng,
            lastCorner.point.lat, lastCorner.point.lng
          ) : Infinity;
        
        if (distanceFromLast > this.minCornerDistance) {
          corners.push({
            point: tracePath[i],
            index: i,
            angle: Math.round(angle * 10) / 10,
            type: angle > this.sharpCornerThreshold ? 'sharp' : 'medium',
            severity: this.getCornerSeverity(angle)
          });
        }
      }
    }
    
    console.log(`🎯 ${corners.length} virages détectés automatiquement`);
    return corners;
  }

  // 📊 Déterminer la sévérité d'un virage
  getCornerSeverity(angle) {
    if (angle < 20) return 'gentle';
    if (angle < 35) return 'medium';
    if (angle < 60) return 'sharp';
    return 'hairpin';
  }

  // 🏁 Générer des secteurs intelligents basés sur les virages
  generateSmartSectors(tracePath) {
    const corners = this.detectCorners(tracePath);
    
    if (corners.length === 0) {
      // Pas de virages détectés, utiliser secteurs par distance
      return this.generateDistanceSectors(tracePath, 3);
    }

    let sectors = [];
    
    // Secteur 1: Départ → Premier virage majeur
    const firstMajorCorner = corners.find(c => c.type === 'sharp') || corners[0];
    sectors.push({
      id: 1,
      name: "Launch Sector",
      startPoint: tracePath[0],
      endPoint: firstMajorCorner.point,
      startIndex: 0,
      endIndex: firstMajorCorner.index,
      type: "acceleration",
      description: "Zone de départ et accélération"
    });

    // Secteurs techniques basés sur les virages
    for (let i = 0; i < corners.length - 1; i++) {
      const sectorType = this.determineSectorType(corners[i], corners[i + 1]);
      sectors.push({
        id: i + 2,
        name: `Technical Sector ${i + 1}`,
        startPoint: corners[i].point,
        endPoint: corners[i + 1].point,
        startIndex: corners[i].index,
        endIndex: corners[i + 1].index,
        type: sectorType,
        difficulty: corners[i].severity,
        description: `Virage ${corners[i].severity} (${corners[i].angle}°)`
      });
    }

    // Secteur final: Dernier virage → Ligne d'arrivée
    const lastCorner = corners[corners.length - 1];
    sectors.push({
      id: sectors.length + 1,
      name: "Final Rush",
      startPoint: lastCorner.point,
      endPoint: tracePath[tracePath.length - 1],
      startIndex: lastCorner.index,
      endIndex: tracePath.length - 1,
      type: "sprint",
      description: "Sprint final vers l'arrivée"
    });

    console.log(`🏁 ${sectors.length} secteurs intelligents générés`);
    return sectors;
  }

  // 📏 Générer des secteurs par distance égale (fallback)
  generateDistanceSectors(tracePath, numberOfSectors = 3) {
    const totalDistance = this.calculateTotalDistance(tracePath);
    const sectorDistance = totalDistance / numberOfSectors;
    
    let sectors = [];
    let currentDistance = 0;
    let sectorIndex = 0;
    let lastSectorStart = 0;

    for (let i = 0; i < tracePath.length - 1; i++) {
      const segmentDistance = this.calculateDistance(
        tracePath[i].lat, tracePath[i].lng,
        tracePath[i + 1].lat, tracePath[i + 1].lng
      );
      currentDistance += segmentDistance;
      
      // Nouveau secteur atteint
      if (currentDistance >= sectorDistance * (sectorIndex + 1) && sectorIndex < numberOfSectors - 1) {
        sectors.push({
          id: sectorIndex + 1,
          name: `Sector ${sectorIndex + 1}`,
          startPoint: tracePath[lastSectorStart],
          endPoint: tracePath[i],
          startIndex: lastSectorStart,
          endIndex: i,
          type: "distance",
          distance: Math.round(sectorDistance),
          description: `Secteur ${Math.round(sectorDistance)}m`
        });
        
        lastSectorStart = i;
        sectorIndex++;
      }
    }

    // Dernier secteur
    if (sectorIndex < numberOfSectors) {
      sectors.push({
        id: numberOfSectors,
        name: `Sector ${numberOfSectors}`,
        startPoint: tracePath[lastSectorStart],
        endPoint: tracePath[tracePath.length - 1],
        startIndex: lastSectorStart,
        endIndex: tracePath.length - 1,
        type: "distance",
        distance: Math.round(totalDistance - (sectorDistance * (numberOfSectors - 1))),
        description: "Secteur final"
      });
    }

    console.log(`📏 ${sectors.length} secteurs par distance générés`);
    return sectors;
  }

  // 📊 Calculer la distance totale d'un tracé
  calculateTotalDistance(tracePath) {
    let totalDistance = 0;
    for (let i = 0; i < tracePath.length - 1; i++) {
      totalDistance += this.calculateDistance(
        tracePath[i].lat, tracePath[i].lng,
        tracePath[i + 1].lat, tracePath[i + 1].lng
      );
    }
    return totalDistance;
  }

  // 🎮 Déterminer le type de secteur entre deux virages
  determineSectorType(corner1, corner2) {
    const avgSeverity = (corner1.angle + corner2.angle) / 2;
    
    if (avgSeverity > 50) return "technical";
    if (avgSeverity > 30) return "mixed";
    return "flowing";
  }

  // 🏁 Fonction principale : générer secteurs pour une course
  generateSectorsForCourse(course) {
    if (!course || !course.tracePath || course.tracePath.length < 2) {
      console.warn('Course invalide pour génération de secteurs');
      return [];
    }

    console.log(`🎯 Génération secteurs pour: ${course.nom}`);
    
    // Essayer la détection intelligente d'abord
    const smartSectors = this.generateSmartSectors(course.tracePath);
    
    // Ajouter des métadonnées
    smartSectors.forEach(sector => {
      sector.courseId = course.id;
      sector.courseName = course.nom;
    });

    return smartSectors;
  }
}

// 🌟 Créer une instance globale
window.SectorDetection = new SectorDetection();

console.log('🏁 Système de détection automatique des secteurs chargé');
