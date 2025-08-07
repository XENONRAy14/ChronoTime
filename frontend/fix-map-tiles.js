/**
 * SOLUTION ULTRA SIMPLE POUR GARANTIR L'AFFICHAGE DES TUILES
 * Ne fait que l'essentiel - pas de complexité inutile
 */
(function() {
  'use strict';

  console.log('📍 Fix tuiles simple activé');

  // Attendre que la carte soit créée
  function fixTiles() {
    if (!window.MapFunctions || !window.MapFunctions.currentMap) {
      setTimeout(fixTiles, 500);
      return;
    }

    const map = window.MapFunctions.currentMap;

    // Fonction simple de réparation
    function applyFix() {
      // Forcer redimensionnement
      map.invalidateSize(true);

      // Forcer rechargement tuiles
      map.eachLayer(function(layer) {
        if (layer._url) {
          layer.redraw();
        }
      });

      console.log('✅ Carte réparée');
    }

    // Appliquer immédiatement et après délais
    applyFix();
    setTimeout(applyFix, 1000);
    setTimeout(applyFix, 3000);

    // Aussi après changement d'orientation
    window.addEventListener('orientationchange', function() {
      setTimeout(applyFix, 500);
    });

    // Aussi après resize
    window.addEventListener('resize', function() {
      setTimeout(applyFix, 500);
    });
  }

  // Démarrer le processus
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixTiles);
  } else {
    setTimeout(fixTiles, 500);
  }
})();
