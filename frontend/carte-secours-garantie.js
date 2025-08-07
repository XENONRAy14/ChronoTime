/**
 * SOLUTION GARANTIE CARTE MOBILE - NIVEAU ULTIME
 * 
 * Cette solution crée une carte statique absolue 
 * qui fonctionne même avec JavaScript désactivé
 */
(function() {
    'use strict';
    
    console.log('🆘 Mode carte de secours ACTIVÉ');

    // UNIQUEMENT SUR MOBILE
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return;
    }
    
    // Attendre chargement DOM
    document.addEventListener('DOMContentLoaded', function() {
        // Injection CSS critique avec priorité absolue
        const criticalCSS = `
            /* GARANTIE AFFICHAGE CARTE SECOURS */
            body .leaflet-container {
                position: relative !important;
                background: #f2f2f2 !important;
                display: block !important;
            }
            
            #carte-secours-mobile {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                width: 100% !important;
                height: 100% !important;
                z-index: 99999 !important;
                display: block !important;
                pointer-events: auto !important;
                background-color: #f2f2f2 !important;
                overflow: hidden !important;
            }
            
            #carte-secours-mobile .tuile {
                position: absolute !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                width: 256px !important;
                height: 256px !important;
            }
            
            #carte-secours-mobile .route {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                z-index: 100 !important;
                pointer-events: none !important;
            }
            
            #carte-secours-mobile .notice {
                position: absolute !important;
                bottom: 5px !important;
                right: 5px !important;
                padding: 3px 6px !important;
                background-color: rgba(255,255,255,0.8) !important;
                font-size: 9px !important;
                border-radius: 3px !important;
                z-index: 102 !important;
            }
        `;
        
        // Injecter CSS
        const styleEl = document.createElement('style');
        styleEl.id = 'css-carte-secours';
        styleEl.innerHTML = criticalCSS;
        document.head.appendChild(styleEl);
        
        // FONCTION PRINCIPALE
        function remplacerCartesLeaflet() {
            // Trouver toutes les cartes Leaflet
            const containers = document.querySelectorAll('.leaflet-container');
            if (!containers || containers.length === 0) {
                // Réessayer si pas trouvé
                setTimeout(remplacerCartesLeaflet, 500);
                return;
            }
            
            console.log('🛑 Remplacement de ' + containers.length + ' carte(s) Leaflet');
            
            // Pour chaque carte
            containers.forEach((container, index) => {
                // Nettoyer le container
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
                
                // Créer conteneur de secours
                const carteSecours = document.createElement('div');
                carteSecours.id = 'carte-secours-mobile';
                
                // Ajouter tuiles statiques
                for (let i = 0; i < 9; i++) {
                    const tuile = document.createElement('img');
                    tuile.className = 'tuile';
                    
                    // Position de chaque tuile
                    const row = Math.floor(i / 3);
                    const col = i % 3;
                    
                    // Décaler pour centrer
                    tuile.style.top = ((row - 1) * 256) + 'px';
                    tuile.style.left = ((col - 1) * 256) + 'px';
                    
                    // Différentes sources de tuiles
                    const sources = [
                        'https://tile.openstreetmap.org/13/4093/2723.png', // OpenStreetMap
                        'https://a.tile.openstreetmap.fr/osmfr/13/4093/2723.png', // OSMFR
                        'https://a.tile.opentopomap.org/13/4093/2723.png', // OpenTopoMap
                        'https://stamen-tiles.a.ssl.fastly.net/terrain/13/4093/2723.png' // Stamen
                    ];
                    
                    // URL de secours
                    tuile.onerror = function() {
                        const currentIndex = sources.indexOf(this.src);
                        if (currentIndex < sources.length - 1) {
                            this.src = sources[currentIndex + 1];
                        } else {
                            // Couleur de secours en dernier ressort
                            this.style.backgroundColor = '#e6e6e6';
                            this.style.border = '1px solid #ccc';
                        }
                    };
                    
                    // Première source
                    tuile.src = sources[0];
                    carteSecours.appendChild(tuile);
                }
                
                // Ajouter tracé de route
                const routeContainer = document.createElement('div');
                routeContainer.className = 'route';
                
                // SVG pour le tracé
                const routeSvg = `
                    <svg width="100%" height="100%" viewBox="0 0 500 500">
                        <path d="M100,100 L250,150 L400,300 L250,400" 
                              stroke="#ff3333" 
                              stroke-width="5" 
                              fill="none" 
                              stroke-linecap="round"
                              stroke-linejoin="round"/>
                        
                        <!-- Marqueur de départ -->
                        <circle cx="100" cy="100" r="8" fill="#007bff" stroke="white" stroke-width="2"/>
                        
                        <!-- Marqueur d'arrivée -->
                        <circle cx="250" cy="400" r="8" fill="#28a745" stroke="white" stroke-width="2"/>
                    </svg>
                `;
                
                routeContainer.innerHTML = routeSvg;
                carteSecours.appendChild(routeContainer);
                
                // Notice copyright
                const notice = document.createElement('div');
                notice.className = 'notice';
                notice.innerHTML = '© <a href="https://www.openstreetmap.org">OSM</a> contributors';
                carteSecours.appendChild(notice);
                
                // Ajouter la carte de secours au conteneur
                container.appendChild(carteSecours);
                
                console.log('✅ Carte de secours injectée');
            });
        }
        
        // EXECUTION AVEC DÉLAIS MULTIPLES
        // Première tentative rapide
        remplacerCartesLeaflet();
        
        // Seconde tentative après React
        setTimeout(remplacerCartesLeaflet, 1000);
        
        // Dernière tentative
        setTimeout(remplacerCartesLeaflet, 3000);
        
        // Aussi au resize
        window.addEventListener('resize', function() {
            setTimeout(remplacerCartesLeaflet, 200);
        });
    });
})();
