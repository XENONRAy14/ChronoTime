/**
 * SOLUTION MOBILE DESKTOP MODE
 * Force le navigateur mobile à se comporter comme un desktop pour les tuiles
 */
(function() {
  'use strict';
  
  // Détection mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (!isMobile) {
    return; // Pas besoin sur desktop
  }
  
  console.log('📱 Mode desktop forcé pour mobile activé');
  
  // Intercepter les requêtes XMLHttpRequest (utilisées par Leaflet)
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    this._url = url;
    return originalOpen.call(this, method, url, async, user, password);
  };
  
  XMLHttpRequest.prototype.send = function(data) {
    // Si c'est une requête de tuile, modifier le User-Agent
    if (this._url && (
        this._url.includes('tile.openstreetmap') ||
        this._url.includes('opentopomap') ||
        this._url.match(/\/\d+\/\d+\/\d+\.png/)
    )) {
      // Forcer User-Agent desktop
      this.setRequestHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    }
    
    return originalSend.call(this, data);
  };
  
  // Aussi intercepter fetch si utilisé
  const originalFetch = window.fetch;
  window.fetch = function(input, init = {}) {
    const url = typeof input === 'string' ? input : input.url;
    
    // Si c'est une requête de tuile
    if (url && (
        url.includes('tile.openstreetmap') ||
        url.includes('opentopomap') ||
        url.match(/\/\d+\/\d+\/\d+\.png/)
    )) {
      // Ajouter User-Agent desktop
      init.headers = init.headers || {};
      init.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    }
    
    return originalFetch.call(this, input, init);
  };
  
  console.log('✅ Interception requêtes tuiles activée');
  
})();
