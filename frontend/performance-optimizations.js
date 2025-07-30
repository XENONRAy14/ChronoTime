// OPTIMISATIONS DE PERFORMANCE
// Lazy loading, cache, debouncing, et optimisations diverses

const PerformanceOptimizations = {
  
  // Cache pour les données
  cache: new Map(),
  
  // Initialiser toutes les optimisations
  init() {
    this.setupLazyLoading();
    this.optimizeImages();
    this.setupServiceWorker();
    this.optimizeMapRendering();
    this.setupDebouncing();
    this.optimizeDataLoading();
    this.setupMemoryManagement();
    this.monitorPerformance();
  },
  
  // Lazy loading pour les images et contenus
  setupLazyLoading() {
    // Observer pour le lazy loading
    const lazyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          
          // Lazy loading des images
          if (element.tagName === 'IMG' && element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
            lazyObserver.unobserve(element);
          }
          
          // Lazy loading des cartes
          if (element.classList.contains('lazy-map')) {
            this.loadMapLazy(element);
            lazyObserver.unobserve(element);
          }
          
          // Lazy loading des composants
          if (element.classList.contains('lazy-component')) {
            this.loadComponentLazy(element);
            lazyObserver.unobserve(element);
          }
        }
      });
    }, {
      rootMargin: '50px'
    });
    
    // Observer tous les éléments lazy
    setTimeout(() => {
      const lazyElements = document.querySelectorAll('[data-src], .lazy-map, .lazy-component');
      lazyElements.forEach(el => lazyObserver.observe(el));
    }, 1000);
  },
  
  // Optimiser les images
  optimizeImages() {
    // Compression et redimensionnement automatique
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Ajouter des attributs de performance
      img.loading = 'lazy';
      img.decoding = 'async';
      
      // Optimiser la taille selon l'écran
      if (window.innerWidth <= 768) {
        // Réduire la qualité sur mobile
        if (img.src && !img.src.includes('?')) {
          img.src += '?w=400&q=70';
        }
      }
    });
  },
  
  // Service Worker pour le cache
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      // Créer le service worker inline
      const swCode = `
        const CACHE_NAME = 'chronotime-v1';
        const urlsToCache = [
          '/',
          '/index.html',
          '/style.css',
          '/responsive.css',
          '/accessibility-improvements.css',
          '/api.js',
          '/app.js',
          '/map.js',
          '/legal-disclaimer.js',
          '/legal-footer.js',
          '/mobile-navigation.js',
          '/ux-improvements.js',
          '/performance-optimizations.js'
        ];
        
        self.addEventListener('install', event => {
          event.waitUntil(
            caches.open(CACHE_NAME)
              .then(cache => cache.addAll(urlsToCache))
          );
        });
        
        self.addEventListener('fetch', event => {
          event.respondWith(
            caches.match(event.request)
              .then(response => {
                if (response) {
                  return response;
                }
                return fetch(event.request);
              })
          );
        });
      `;
      
      // Créer un blob URL pour le service worker
      const blob = new Blob([swCode], { type: 'application/javascript' });
      const swUrl = URL.createObjectURL(blob);
      
      navigator.serviceWorker.register(swUrl)
        .then(registration => {
          console.log('Service Worker enregistré:', registration);
        })
        .catch(error => {
          console.log('Erreur Service Worker:', error);
        });
    }
  },
  
  // Optimiser le rendu des cartes
  optimizeMapRendering() {
    // Throttle pour les événements de carte
    let mapUpdateTimeout;
    
    // Override des fonctions de carte pour optimiser
    if (window.initMap) {
      const originalInitMap = window.initMap;
      window.initMap = (...args) => {
        // Différer l'initialisation si pas visible
        const mapContainer = document.getElementById('map-container');
        if (mapContainer && !this.isElementVisible(mapContainer)) {
          mapContainer.classList.add('lazy-map');
          return;
        }
        
        return originalInitMap.apply(this, args);
      };
    }
    
    // Optimiser les mises à jour de position GPS
    if (window.updateGPSPosition) {
      const originalUpdateGPS = window.updateGPSPosition;
      window.updateGPSPosition = (position) => {
        clearTimeout(mapUpdateTimeout);
        mapUpdateTimeout = setTimeout(() => {
          originalUpdateGPS(position);
        }, 100); // Throttle à 100ms
      };
    }
  },
  
  // Charger une carte en lazy
  loadMapLazy(element) {
    // Simuler le chargement de carte
    const placeholder = element.querySelector('.map-placeholder');
    if (placeholder) {
      placeholder.style.opacity = '0';
      setTimeout(() => {
        if (window.initMap) {
          window.initMap();
        }
        element.classList.remove('lazy-map');
      }, 300);
    }
  },
  
  // Charger un composant en lazy
  loadComponentLazy(element) {
    const componentType = element.dataset.component;
    
    switch (componentType) {
      case 'chrono-list':
        this.loadChronoList(element);
        break;
      case 'course-list':
        this.loadCourseList(element);
        break;
      default:
        element.classList.remove('lazy-component');
    }
  },
  
  // Vérifier si un élément est visible
  isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  },
  
  // Setup debouncing pour les inputs
  setupDebouncing() {
    const debouncedInputs = document.querySelectorAll('input[type="search"], input[type="text"]');
    
    debouncedInputs.forEach(input => {
      let debounceTimeout;
      
      input.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          // Déclencher la recherche ou validation
          const event = new CustomEvent('debouncedInput', {
            detail: { value: e.target.value, target: e.target }
          });
          document.dispatchEvent(event);
        }, 300);
      });
    });
  },
  
  // Optimiser le chargement des données
  optimizeDataLoading() {
    // Cache des requêtes API
    const originalFetch = window.fetch;
    
    window.fetch = async (url, options = {}) => {
      // Vérifier le cache pour les GET
      if (!options.method || options.method === 'GET') {
        const cacheKey = url + JSON.stringify(options);
        
        if (this.cache.has(cacheKey)) {
          const cached = this.cache.get(cacheKey);
          const now = Date.now();
          
          // Cache valide pendant 5 minutes
          if (now - cached.timestamp < 5 * 60 * 1000) {
            return Promise.resolve(new Response(JSON.stringify(cached.data), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }));
          }
        }
      }
      
      // Faire la requête
      const response = await originalFetch(url, options);
      
      // Mettre en cache les réponses GET réussies
      if (response.ok && (!options.method || options.method === 'GET')) {
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();
        
        this.cache.set(url + JSON.stringify(options), {
          data: data,
          timestamp: Date.now()
        });
      }
      
      return response;
    };
  },
  
  // Charger la liste des chronos en lazy
  async loadChronoList(element) {
    try {
      // Afficher un skeleton
      element.innerHTML = this.createSkeletonList(3);
      
      // Charger les données
      const chronos = await window.API.getChronos();
      
      // Afficher les données
      setTimeout(() => {
        this.renderChronoList(element, chronos);
        element.classList.remove('lazy-component');
      }, 500);
      
    } catch (error) {
      element.innerHTML = '<p style="color: #ff6666;">Erreur de chargement</p>';
    }
  },
  
  // Charger la liste des courses en lazy
  async loadCourseList(element) {
    try {
      // Afficher un skeleton
      element.innerHTML = this.createSkeletonList(2);
      
      // Charger les données
      const courses = await window.API.getCourses();
      
      // Afficher les données
      setTimeout(() => {
        this.renderCourseList(element, courses);
        element.classList.remove('lazy-component');
      }, 500);
      
    } catch (error) {
      element.innerHTML = '<p style="color: #ff6666;">Erreur de chargement</p>';
    }
  },
  
  // Créer un skeleton loader
  createSkeletonList(count) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="skeleton-item" style="
          height: 60px;
          background: linear-gradient(90deg, #333 25%, #444 50%, #333 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          margin-bottom: 10px;
          border-radius: 8px;
        "></div>
      `;
    }
    return html;
  },
  
  // Rendu optimisé de la liste des chronos
  renderChronoList(element, chronos) {
    if (!chronos || chronos.length === 0) {
      element.innerHTML = '<p>Aucun chrono trouvé</p>';
      return;
    }
    
    // Utiliser DocumentFragment pour optimiser
    const fragment = document.createDocumentFragment();
    
    chronos.forEach(chrono => {
      const div = document.createElement('div');
      div.className = 'chrono-item';
      div.innerHTML = `
        <h4>${chrono.course?.name || 'Course inconnue'}</h4>
        <p>Temps: ${chrono.time}s</p>
        <p>Date: ${new Date(chrono.date).toLocaleDateString()}</p>
      `;
      fragment.appendChild(div);
    });
    
    element.innerHTML = '';
    element.appendChild(fragment);
  },
  
  // Rendu optimisé de la liste des courses
  renderCourseList(element, courses) {
    if (!courses || courses.length === 0) {
      element.innerHTML = '<p>Aucune course trouvée</p>';
      return;
    }
    
    // Utiliser DocumentFragment pour optimiser
    const fragment = document.createDocumentFragment();
    
    courses.forEach(course => {
      const div = document.createElement('div');
      div.className = 'course-item';
      div.innerHTML = `
        <h4>${course.name}</h4>
        <p>${course.description || 'Pas de description'}</p>
        <p>Points GPS: ${course.gpsTrace?.length || 0}</p>
      `;
      fragment.appendChild(div);
    });
    
    element.innerHTML = '';
    element.appendChild(fragment);
  },
  
  // Gestion de la mémoire
  setupMemoryManagement() {
    // Nettoyer le cache périodiquement
    setInterval(() => {
      this.cleanCache();
    }, 10 * 60 * 1000); // Toutes les 10 minutes
    
    // Nettoyer lors de la fermeture
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
    
    // Nettoyer lors du changement de visibilité
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.cleanup();
      }
    });
  },
  
  // Nettoyer le cache
  cleanCache() {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
    
    console.log(`Cache nettoyé. Taille: ${this.cache.size}`);
  },
  
  // Nettoyage général
  cleanup() {
    // Vider le cache
    this.cache.clear();
    
    // Nettoyer les timeouts
    const highestTimeoutId = setTimeout(() => {}, 0);
    for (let i = 0; i < highestTimeoutId; i++) {
      clearTimeout(i);
    }
    
    // Nettoyer les intervals
    const highestIntervalId = setInterval(() => {}, 0);
    for (let i = 0; i < highestIntervalId; i++) {
      clearInterval(i);
    }
  },
  
  // Monitoring des performances
  monitorPerformance() {
    // Mesurer les Core Web Vitals
    if ('web-vital' in window) {
      // LCP - Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // FID - First Input Delay
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      }).observe({ entryTypes: ['first-input'] });
      
      // CLS - Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        console.log('CLS:', clsValue);
      }).observe({ entryTypes: ['layout-shift'] });
    }
    
    // Monitoring de la mémoire
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        console.log('Mémoire utilisée:', Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB');
        
        // Alerte si mémoire élevée
        if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
          console.warn('Utilisation mémoire élevée, nettoyage recommandé');
          this.cleanup();
        }
      }, 30000); // Toutes les 30 secondes
    }
    
    // Monitoring des requêtes réseau
    this.monitorNetworkRequests();
  },
  
  // Monitoring des requêtes réseau
  monitorNetworkRequests() {
    const requestTimes = new Map();
    
    // Observer les requêtes
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'navigation' || entry.entryType === 'resource') {
          console.log(`${entry.name}: ${Math.round(entry.duration)}ms`);
          
          // Alerte pour les requêtes lentes
          if (entry.duration > 3000) {
            console.warn(`Requête lente détectée: ${entry.name} (${Math.round(entry.duration)}ms)`);
          }
        }
      });
    }).observe({ entryTypes: ['navigation', 'resource'] });
  },
  
  // Précharger les ressources critiques
  preloadCriticalResources() {
    const criticalResources = [
      '/api/courses',
      '/api/chronos'
    ];
    
    criticalResources.forEach(url => {
      // Précharger avec une priorité élevée
      fetch(url, { 
        method: 'GET',
        priority: 'high'
      }).catch(() => {
        // Ignorer les erreurs de préchargement
      });
    });
  }
};

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
  PerformanceOptimizations.init();
});

// Export global
window.PerformanceOptimizations = PerformanceOptimizations;
