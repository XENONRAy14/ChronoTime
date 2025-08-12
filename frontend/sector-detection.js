// 🏁 SYSTÈME DE DÉTECTION AUTOMATIQUE DES SECTEURS
// Détection intelligente des virages et génération automatique des secteurs

class SectorDetection {
  constructor() {
    this.minCornerAngle = 8; // Angle minimum pour détecter un virage (degrés) - PLUS SENSIBLE
    this.minCornerDistance = 50; // Distance minimum entre virages (mètres) - PLUS PROCHE
    this.sharpCornerThreshold = 30; // Seuil pour virage serré - PLUS BAS
    this.minSectors = 4; // Nombre minimum de secteurs à générer
    this.maxSectors = 8; // Nombre maximum de secteurs
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
      // Pas de virages détectés, utiliser secteurs par distance avec minimum requis
      return this.generateDistanceSectors(tracePath, this.minSectors);
    }

    // Si pas assez de virages, compléter avec secteurs par distance
    if (corners.length < this.minSectors - 2) {
      return this.generateDistanceSectors(tracePath, this.minSectors);
    }

    let sectors = [];
    
    // Répartir les virages en secteurs plus équitablement
    const targetSectors = Math.min(Math.max(corners.length + 2, this.minSectors), this.maxSectors);
    const cornersPerSector = Math.max(1, Math.floor(corners.length / (targetSectors - 2)));
    
    // Secteur 1: Départ → Premier groupe de virages
    const firstSectorEnd = Math.min(cornersPerSector - 1, corners.length - 1);
    sectors.push({
      id: 1,
      name: "Launch Sector",
      startPoint: tracePath[0],
      endPoint: corners[firstSectorEnd].point,
      startIndex: 0,
      endIndex: corners[firstSectorEnd].index,
      type: "acceleration",
      description: "Zone de départ et première série de virages",
      color: "#FF0000" // Rouge
    });

    // Secteurs techniques basés sur les groupes de virages
    let currentCornerIndex = firstSectorEnd;
    let sectorId = 2;
    
    while (currentCornerIndex < corners.length - 1 && sectorId < targetSectors) {
      const nextCornerIndex = Math.min(currentCornerIndex + cornersPerSector, corners.length - 1);
      
      // Calculer la difficulté moyenne du secteur
      let avgAngle = 0;
      let maxAngle = 0;
      for (let i = currentCornerIndex; i <= nextCornerIndex; i++) {
        avgAngle += corners[i].angle;
        maxAngle = Math.max(maxAngle, corners[i].angle);
      }
      avgAngle /= (nextCornerIndex - currentCornerIndex + 1);
      
      const difficulty = this.getCornerSeverity(maxAngle);
      const sectorType = this.determineSectorType(corners[currentCornerIndex], corners[nextCornerIndex]);
      
      sectors.push({
        id: sectorId,
        name: `Technical Sector ${sectorId - 1}`,
        startPoint: corners[currentCornerIndex].point,
        endPoint: corners[nextCornerIndex].point,
        startIndex: corners[currentCornerIndex].index,
        endIndex: corners[nextCornerIndex].index,
        type: sectorType,
        difficulty: difficulty,
        description: `${nextCornerIndex - currentCornerIndex + 1} virages, max ${maxAngle.toFixed(1)}°`,
        color: this.getSectorColor(sectorId)
      });
      
      currentCornerIndex = nextCornerIndex;
      sectorId++;
    }

    // Secteur final: Derniers virages → Ligne d'arrivée
    const lastCorner = corners[corners.length - 1];
    sectors.push({
      id: sectorId,
      name: "Final Rush",
      startPoint: lastCorner.point,
      endPoint: tracePath[tracePath.length - 1],
      startIndex: lastCorner.index,
      endIndex: tracePath.length - 1,
      type: "sprint",
      description: "Sprint final vers l'arrivée",
      color: this.getSectorColor(sectorId)
    });

    console.log(`🏁 ${sectors.length} secteurs intelligents générés (${corners.length} virages détectés)`);
    return sectors;
  }

  // 📏 Générer des secteurs par distance égale (fallback)
  generateDistanceSectors(tracePath, numSectors = 4) {
    const sectors = [];
    const totalPoints = tracePath.length;
    const pointsPerSector = Math.floor(totalPoints / numSectors);

    for (let i = 0; i < numSectors; i++) {
      const startIndex = i * pointsPerSector;
      const endIndex = i === numSectors - 1 ? totalPoints - 1 : (i + 1) * pointsPerSector;
      
      sectors.push({
        id: i + 1,
        name: i === 0 ? "Launch Sector" : i === numSectors - 1 ? "Final Rush" : `Sector ${i + 1}`,
        startPoint: tracePath[startIndex],
        endPoint: tracePath[endIndex],
        startIndex: startIndex,
        endIndex: endIndex,
        type: i === 0 ? "acceleration" : i === numSectors - 1 ? "sprint" : "technical",
        description: i === 0 ? "Zone de départ" : i === numSectors - 1 ? "Sprint final" : `Secteur technique ${i}`,
        color: this.getSectorColor(i + 1)
      });
    }

    console.log(`📏 ${numSectors} secteurs par distance générés (fallback)`);
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
