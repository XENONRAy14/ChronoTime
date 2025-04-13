// Composant principal de l'application
const App = () => {
  const [activeTab, setActiveTab] = React.useState('chrono');
  const [mapInitialized, setMapInitialized] = React.useState(false);
  const [courses, setCourses] = React.useState([]);
  const [chronos, setChronos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  // Charger les données au démarrage de l'application
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger les courses depuis l'API
        const coursesData = await window.API.getCourses();
        if (coursesData && coursesData.length > 0) {
          // Transformer les données pour correspondre à notre format
          const formattedCourses = coursesData.map(course => ({
            id: course._id,
            nom: course.nom,
            distance: course.distance,
            denivele: course.denivele,
            tracePath: course.tracePath
          }));
          setCourses(formattedCourses);
        } else {
          // Si aucune course n'est trouvée, utiliser des données d'exemple
          setCourses([
            { id: "example1", nom: "Trail du Mont Blanc", distance: 42, denivele: 2500, tracePath: null },
            { id: "example2", nom: "Course des Crêtes", distance: 23, denivele: 1200, tracePath: null },
            { id: "example3", nom: "Montée de l'Alpe d'Huez", distance: 13.8, denivele: 1120, tracePath: null }
          ]);
        }
        
        // Charger les chronos depuis l'API
        const chronosData = await window.API.getChronos();
        if (chronosData && chronosData.length > 0) {
          // Transformer les données pour correspondre à notre format
          const formattedChronos = chronosData.map(chrono => ({
            id: chrono._id,
            utilisateur: chrono.utilisateur,
            courseId: chrono.courseId._id,
            temps: chrono.temps,
            date: new Date(chrono.date).toISOString().split('T')[0]
          }));
          setChronos(formattedChronos);
        } else {
          // Si aucun chrono n'est trouvé, utiliser des données d'exemple
          setChronos([
            { id: "example1", utilisateur: "Alice", courseId: "example1", temps: "4:25:30", date: "2025-03-15" },
            { id: "example2", utilisateur: "Bob", courseId: "example1", temps: "4:10:15", date: "2025-03-15" },
            { id: "example3", utilisateur: "Charlie", courseId: "example2", temps: "2:05:45", date: "2025-02-20" },
            { id: "example4", utilisateur: "Alice", courseId: "example2", temps: "1:58:30", date: "2025-02-20" },
            { id: "example5", utilisateur: "David", courseId: "example3", temps: "1:15:20", date: "2025-04-01" }
          ]);
        }
        
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Erreur lors du chargement des données. Utilisation des données locales.");
        
        // En cas d'erreur, utiliser des données d'exemple
        setCourses([
          { id: "example1", nom: "Trail du Mont Blanc", distance: 42, denivele: 2500, tracePath: null },
          { id: "example2", nom: "Course des Crêtes", distance: 23, denivele: 1200, tracePath: null },
          { id: "example3", nom: "Montée de l'Alpe d'Huez", distance: 13.8, denivele: 1120, tracePath: null }
        ]);
        
        setChronos([
          { id: "example1", utilisateur: "Alice", courseId: "example1", temps: "4:25:30", date: "2025-03-15" },
          { id: "example2", utilisateur: "Bob", courseId: "example1", temps: "4:10:15", date: "2025-03-15" },
          { id: "example3", utilisateur: "Charlie", courseId: "example2", temps: "2:05:45", date: "2025-02-20" },
          { id: "example4", utilisateur: "Alice", courseId: "example2", temps: "1:58:30", date: "2025-02-20" },
          { id: "example5", utilisateur: "David", courseId: "example3", temps: "1:15:20", date: "2025-04-01" }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // Configurer une actualisation périodique des données (toutes les 30 secondes)
    const intervalId = setInterval(() => {
      loadData();
    }, 30000);
    
    // Nettoyer l'intervalle lorsque le composant est démonté
    return () => clearInterval(intervalId);
  }, []);
  
  // État pour le formulaire d'ajout de chrono
  const [nouveauChrono, setNouveauChrono] = React.useState({
    utilisateur: "",
    courseId: "",
    temps: "",
    date: new Date().toISOString().split('T')[0]
  });

  // État pour le formulaire d'ajout de course
  const [nouvelleCourse, setNouvelleCourse] = React.useState({
    nom: "",
    distance: "",
    denivele: "",
    tracePath: null
  });
  
  // État pour la carte et le tracé
  const [routeInfo, setRouteInfo] = React.useState({
    distance: 0,
    path: [],
    searchQuery: ""
  });
  
  // État pour le chronomètre GPS
  const [chronoGPS, setChronoGPS] = React.useState({
    courseId: "",
    utilisateur: "",
    status: "idle", // idle, waiting, running, finished
    startTime: null,
    endTime: null,
    currentTime: null,
    elapsedTime: 0,
    watchId: null,
    currentPosition: null,
    distanceToStart: null,
    distanceToEnd: null,
    nearStart: false,
    nearEnd: false,
    error: null
  });

  // Gestion du changement d'onglet
  const changerOnglet = (onglet) => {
    setActiveTab(onglet);
    
    // Réinitialiser les cartes quand on change d'onglet
    setTimeout(() => {
      // Initialiser ou réinitialiser la carte de définition de tracé
      if (onglet === 'carte') {
        if (window.MapFunctions) {
          // Supprimer la carte existante si elle existe
          if (window.MapFunctions.currentMap) {
            window.MapFunctions.currentMap.remove();
          }
          
          const map = window.MapFunctions.createMap('map-container');
          setMapInitialized(true);
          
          // Écouter les mises à jour du tracé
          document.addEventListener('routeUpdated', (event) => {
            setRouteInfo(prevState => ({
              ...prevState,
              distance: event.detail.distance,
              path: event.detail.path
            }));
            
            // Mettre à jour la distance dans le formulaire d'ajout de course
            setNouvelleCourse(prevState => ({
              ...prevState,
              distance: event.detail.distance.toString()
            }));
          });
        }
      }
      
      // Initialiser ou réinitialiser la carte pour le chronomètre GPS
      if (onglet === 'chrono-gps') {
        if (window.MapFunctions) {
          // Supprimer la carte existante si elle existe
          if (window.MapFunctions.currentMap) {
            window.MapFunctions.currentMap.remove();
          }
          
          const map = window.MapFunctions.createMap('gps-map-container');
          
          // Si une course est déjà sélectionnée, afficher son tracé
          if (chronoGPS.courseId) {
            const selectedCourse = courses.find(c => c.id === chronoGPS.courseId);
            if (selectedCourse && selectedCourse.tracePath && selectedCourse.tracePath.length >= 2) {
              // Effacer les marqueurs et tracés existants
              window.MapFunctions.clearRoute();
              
              // Ajouter les marqueurs de départ et d'arrivée
              const startPoint = selectedCourse.tracePath[0];
              const endPoint = selectedCourse.tracePath[selectedCourse.tracePath.length - 1];
              
              // Ajouter le marqueur de départ
              const greenIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              });
              
              const startMarker = L.marker([startPoint.lat, startPoint.lng], {
                draggable: false,
                icon: greenIcon
              }).addTo(window.MapFunctions.currentMap);
              startMarker.bindPopup("Départ");
              window.MapFunctions.markers.push(startMarker);
              
              // Ajouter le marqueur d'arrivée
              const redIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              });
              
              const endMarker = L.marker([endPoint.lat, endPoint.lng], {
                draggable: false,
                icon: redIcon
              }).addTo(window.MapFunctions.currentMap);
              endMarker.bindPopup("Arrivée");
              window.MapFunctions.markers.push(endMarker);
              
              // Ajouter les points intermédiaires
              const blueIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              });
              
              for (let i = 1; i < selectedCourse.tracePath.length - 1; i++) {
                const point = selectedCourse.tracePath[i];
                const waypointMarker = L.marker([point.lat, point.lng], {
                  draggable: false,
                  icon: blueIcon
                }).addTo(window.MapFunctions.currentMap);
                waypointMarker.bindPopup("Point intermédiaire");
                window.MapFunctions.markers.push(waypointMarker);
              }
              
              // Mettre à jour le tracé pour qu'il suive les routes
              window.MapFunctions.updatePolyline();
            }
          }
        }
      }
    }, 100);
  };

  // Gestion des changements dans le formulaire d'ajout de chrono
  const handleChronoChange = (e) => {
    const { name, value } = e.target;
    setNouveauChrono({
      ...nouveauChrono,
      [name]: value
    });
  };

  // Gestion des changements dans le formulaire d'ajout de course
  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setNouvelleCourse({
      ...nouvelleCourse,
      [name]: value
    });
  };

  // Soumission du formulaire d'ajout de chrono
  const ajouterChrono = (e) => {
    e.preventDefault();
    
    // Validation simple
    if (!nouveauChrono.utilisateur || !nouveauChrono.courseId || !nouveauChrono.temps) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    // Ajout du nouveau chrono
    const nouveauChronoComplet = {
      ...nouveauChrono,
      id: chronos.length + 1,
      courseId: parseInt(nouveauChrono.courseId)
    };
    
    setChronos([...chronos, nouveauChronoComplet]);
    
    // Réinitialisation du formulaire
    setNouveauChrono({
      utilisateur: "",
      courseId: "",
      temps: "",
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Soumission du formulaire d'ajout de course
  const ajouterCourse = async (e) => {
    e.preventDefault();
    
    // Validation simple
    if (!nouvelleCourse.nom || !nouvelleCourse.distance || !nouvelleCourse.denivele) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    try {
      // Préparation des données pour l'API
      const courseData = {
        nom: nouvelleCourse.nom,
        distance: parseFloat(nouvelleCourse.distance),
        denivele: parseInt(nouvelleCourse.denivele),
        tracePath: routeInfo.path.length > 0 ? routeInfo.path : null
      };
      
      // Envoi des données au backend
      const nouvelleCourseComplete = await window.API.createCourse(courseData);
      
      // Ajout de la nouvelle course à l'état local
      setCourses([...courses, {
        id: nouvelleCourseComplete._id,
        nom: nouvelleCourseComplete.nom,
        distance: nouvelleCourseComplete.distance,
        denivele: nouvelleCourseComplete.denivele,
        tracePath: nouvelleCourseComplete.tracePath
      }]);
      
      // Réinitialisation du formulaire et du tracé
      setNouvelleCourse({
        nom: "",
        distance: "",
        denivele: "",
        tracePath: null
      });
      
      if (window.MapFunctions) {
        window.MapFunctions.clearRoute();
      }
      
      setRouteInfo({
        distance: 0,
        path: [],
        searchQuery: ""
      });
      
      // Revenir à l'onglet des chronos après avoir ajouté une course
      setActiveTab('chrono');
      
      // Afficher un message de confirmation
      alert("Course ajoutée avec succès!");
    } catch (error) {
      console.error("Erreur lors de l'ajout de la course:", error);
      alert("Erreur lors de l'ajout de la course. Veuillez réessayer.");
    }
  };

  // Fonction pour trier les chronos par temps (du plus rapide au plus lent)
  const trierChronosParTemps = (courseId) => {
    return chronos
      .filter(chrono => chrono.courseId === courseId)
      .sort((a, b) => {
        // Conversion du temps (format "h:mm:ss") en secondes pour comparaison
        const tempsEnSecondesA = convertirTempsEnSecondes(a.temps);
        const tempsEnSecondesB = convertirTempsEnSecondes(b.temps);
        return tempsEnSecondesA - tempsEnSecondesB;
      });
  };

  // Fonction pour convertir un temps au format "h:mm:ss" en secondes
  const convertirTempsEnSecondes = (temps) => {
    const [heures, minutes, secondes] = temps.split(':').map(Number);
    return heures * 3600 + minutes * 60 + secondes;
  };

  // Fonction pour obtenir le nom d'une course à partir de son ID
  const getNomCourse = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.nom : "Course inconnue";
  };
  
  // Fonction pour actualiser manuellement les données
  const refreshData = async () => {
    try {
      setLoading(true);
      
      // Charger les courses depuis l'API
      const coursesData = await window.API.getCourses();
      if (coursesData && coursesData.length > 0) {
        // Transformer les données pour correspondre à notre format
        const formattedCourses = coursesData.map(course => ({
          id: course._id,
          nom: course.nom,
          distance: course.distance,
          denivele: course.denivele,
          tracePath: course.tracePath
        }));
        setCourses(formattedCourses);
      }
      
      // Charger les chronos depuis l'API
      const chronosData = await window.API.getChronos();
      if (chronosData && chronosData.length > 0) {
        // Transformer les données pour correspondre à notre format
        const formattedChronos = chronosData.map(chrono => ({
          id: chrono._id,
          utilisateur: chrono.utilisateur,
          courseId: chrono.courseId._id,
          temps: chrono.temps,
          date: new Date(chrono.date).toISOString().split('T')[0]
        }));
        setChronos(formattedChronos);
      }
      
      setError(null);
      alert("Données actualisées avec succès!");
    } catch (err) {
      console.error("Erreur lors de l'actualisation des données:", err);
      setError("Erreur lors de l'actualisation des données.");
      alert("Erreur lors de l'actualisation des données.");
    } finally {
      setLoading(false);
    }
  };
  
  // Fonctions pour la carte
  const handleSearchPlace = () => {
    if (window.MapFunctions && routeInfo.searchQuery) {
      window.MapFunctions.searchPlace(routeInfo.searchQuery, (place) => {
        if (place) {
          setRouteInfo(prevState => ({
            ...prevState,
            searchQuery: ""
          }));
        } else {
          alert("Lieu non trouvé. Veuillez essayer une autre recherche.");
        }
      });
    }
  };
  
  const handleAddStartMarker = () => {
    console.log("Ajout d'un marqueur de départ");
    if (window.MapFunctions && window.MapFunctions.currentMap) {
      try {
        // Récupérer le centre de la carte
        const center = window.MapFunctions.currentMap.getCenter();
        console.log("Centre de la carte:", center);
        
        // Ajouter le marqueur directement avec Leaflet
        const greenIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        
        const marker = L.marker([center.lat, center.lng], {
          draggable: true,
          icon: greenIcon
        }).addTo(window.MapFunctions.currentMap);
        
        marker.bindPopup("Départ");
        
        // Ajouter le marqueur à la liste des marqueurs
        window.MapFunctions.markers.push(marker);
        
        // Mettre à jour le tracé
        marker.on('dragend', () => {
          window.MapFunctions.updatePolyline();
        });
        
        window.MapFunctions.updatePolyline();
        
        console.log("Marqueur de départ ajouté");
      } catch (error) {
        console.error("Erreur lors de l'ajout du marqueur de départ:", error);
      }
    } else {
      console.error("MapFunctions ou currentMap non disponible");
    }
  };
  
  const handleAddEndMarker = () => {
    console.log("Ajout d'un marqueur d'arrivée");
    if (window.MapFunctions && window.MapFunctions.currentMap) {
      try {
        // Récupérer le centre de la carte
        const center = window.MapFunctions.currentMap.getCenter();
        console.log("Centre de la carte:", center);
        
        // Ajouter le marqueur directement avec Leaflet
        const redIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        
        const marker = L.marker([center.lat, center.lng], {
          draggable: true,
          icon: redIcon
        }).addTo(window.MapFunctions.currentMap);
        
        marker.bindPopup("Arrivée");
        
        // Ajouter le marqueur à la liste des marqueurs
        window.MapFunctions.markers.push(marker);
        
        // Mettre à jour le tracé
        marker.on('dragend', () => {
          window.MapFunctions.updatePolyline();
        });
        
        window.MapFunctions.updatePolyline();
        
        console.log("Marqueur d'arrivée ajouté");
      } catch (error) {
        console.error("Erreur lors de l'ajout du marqueur d'arrivée:", error);
      }
    } else {
      console.error("MapFunctions ou currentMap non disponible");
    }
  };
  
  const handleAddWaypointMarker = () => {
    console.log("Ajout d'un point intermédiaire");
    if (window.MapFunctions && window.MapFunctions.currentMap) {
      try {
        // Récupérer le centre de la carte
        const center = window.MapFunctions.currentMap.getCenter();
        console.log("Centre de la carte:", center);
        
        // Ajouter le marqueur directement avec Leaflet
        const blueIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        
        const marker = L.marker([center.lat, center.lng], {
          draggable: true,
          icon: blueIcon
        }).addTo(window.MapFunctions.currentMap);
        
        marker.bindPopup("Point intermédiaire");
        
        // Ajouter le marqueur à la liste des marqueurs
        window.MapFunctions.markers.push(marker);
        
        // Mettre à jour le tracé
        marker.on('dragend', () => {
          window.MapFunctions.updatePolyline();
        });
        
        window.MapFunctions.updatePolyline();
        
        console.log("Point intermédiaire ajouté");
      } catch (error) {
        console.error("Erreur lors de l'ajout du point intermédiaire:", error);
      }
    } else {
      console.error("MapFunctions ou currentMap non disponible");
    }
  };
  
  const handleClearRoute = () => {
    if (window.MapFunctions) {
      window.MapFunctions.clearRoute();
    }
  };
  
  const handleSearchInputChange = (e) => {
    setRouteInfo(prevState => ({
      ...prevState,
      searchQuery: e.target.value
    }));
  };
  
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchPlace();
    }
  };
  
  // Fonctions pour le chronomètre GPS
  const handleChronoGPSChange = (e) => {
    const { name, value } = e.target;
    setChronoGPS(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Si la course sélectionnée change, afficher le tracé sur la carte
    if (name === 'courseId' && value) {
      // Trouver la course sélectionnée
      const selectedCourseId = value;
      const selectedCourse = courses.find(c => c.id === selectedCourseId);
      
      // Vérifier si la course a un tracé défini
      if (selectedCourse && selectedCourse.tracePath && selectedCourse.tracePath.length >= 2) {
        // Attendre que la carte soit initialisée
        setTimeout(() => {
          if (window.MapFunctions && window.MapFunctions.currentMap) {
            // Effacer les marqueurs et tracés existants
            window.MapFunctions.clearRoute();
            
            // Ajouter les marqueurs de départ et d'arrivée
            const startPoint = selectedCourse.tracePath[0];
            const endPoint = selectedCourse.tracePath[selectedCourse.tracePath.length - 1];
            
            // Ajouter le marqueur de départ
            const greenIcon = L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            });
            
            const startMarker = L.marker([startPoint.lat, startPoint.lng], {
              draggable: false,
              icon: greenIcon
            }).addTo(window.MapFunctions.currentMap);
            startMarker.bindPopup("Départ");
            window.MapFunctions.markers.push(startMarker);
            
            // Ajouter le marqueur d'arrivée
            const redIcon = L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            });
            
            const endMarker = L.marker([endPoint.lat, endPoint.lng], {
              draggable: false,
              icon: redIcon
            }).addTo(window.MapFunctions.currentMap);
            endMarker.bindPopup("Arrivée");
            window.MapFunctions.markers.push(endMarker);
            
            // Ajouter les points intermédiaires
            const blueIcon = L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            });
            
            for (let i = 1; i < selectedCourse.tracePath.length - 1; i++) {
              const point = selectedCourse.tracePath[i];
              const waypointMarker = L.marker([point.lat, point.lng], {
                draggable: false,
                icon: blueIcon
              }).addTo(window.MapFunctions.currentMap);
              waypointMarker.bindPopup("Point intermédiaire");
              window.MapFunctions.markers.push(waypointMarker);
            }
            
            // Mettre à jour le tracé pour qu'il suive les routes
            window.MapFunctions.updatePolyline();
          }
        }, 500);
      }
    }
  };
  
  // Calculer la distance entre deux points GPS
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    
    // Convertir les coordonnées en objets LatLng de Leaflet
    const point1 = L.latLng(lat1, lon1);
    const point2 = L.latLng(lat2, lon2);
    
    // Calculer la distance en mètres
    return point1.distanceTo(point2);
  };
  
  // Formater le temps écoulé en h:mm:ss
  const formatTime = (timeInMs) => {
    if (!timeInMs) return "0:00:00";
    
    const totalSeconds = Math.floor(timeInMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Démarrer le suivi GPS
  const startGPSTracking = () => {
    // Vérifier si la géolocalisation est disponible
    if (!navigator.geolocation) {
      setChronoGPS(prevState => ({
        ...prevState,
        error: "La géolocalisation n'est pas prise en charge par votre navigateur.",
        status: "idle"
      }));
      return;
    }
    
    // Vérifier si une course est sélectionnée
    if (!chronoGPS.courseId) {
      setChronoGPS(prevState => ({
        ...prevState,
        error: "Veuillez sélectionner une course.",
        status: "idle"
      }));
      return;
    }
    
    // Vérifier si un nom d'utilisateur est saisi
    if (!chronoGPS.utilisateur) {
      setChronoGPS(prevState => ({
        ...prevState,
        error: "Veuillez saisir votre nom.",
        status: "idle"
      }));
      return;
    }
    
    // Récupérer la course sélectionnée
    const selectedCourse = courses.find(c => c.id === chronoGPS.courseId);
    
    // Vérifier si la course existe et a un tracé défini
    if (!selectedCourse || !selectedCourse.tracePath || selectedCourse.tracePath.length < 2) {
      setChronoGPS(prevState => ({
        ...prevState,
        error: "Cette course n'a pas de tracé défini. Veuillez d'abord définir un tracé pour cette course.",
        status: "idle"
      }));
      return;
    }
    
    // Obtenir les points de départ et d'arrivée
    const startPoint = selectedCourse.tracePath[0];
    const endPoint = selectedCourse.tracePath[selectedCourse.tracePath.length - 1];
    
    // Mettre à jour l'état du chronomètre
    setChronoGPS(prevState => ({
      ...prevState,
      status: "waiting",
      error: null,
      startTime: null,
      endTime: null,
      elapsedTime: 0
    }));
    
    // Démarrer le suivi GPS
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Calculer la distance jusqu'au point de départ et d'arrivée
        const distanceToStart = calculateDistance(latitude, longitude, startPoint.lat, startPoint.lng);
        const distanceToEnd = calculateDistance(latitude, longitude, endPoint.lat, endPoint.lng);
        
        // Déterminer si on est proche du départ ou de l'arrivée (dans un rayon de 20 mètres)
        const nearStart = distanceToStart !== null && distanceToStart < 20;
        const nearEnd = distanceToEnd !== null && distanceToEnd < 20;
        
        // Mettre à jour la position sur la carte si elle est initialisée
        if (window.MapFunctions && window.MapFunctions.currentMap) {
          // Supprimer l'ancien marqueur de position si existant
          if (window.userPositionMarker) {
            window.MapFunctions.currentMap.removeLayer(window.userPositionMarker);
          }
          
          // Créer un nouveau marqueur pour la position actuelle
          window.userPositionMarker = L.marker([latitude, longitude], {
            icon: L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })
          }).addTo(window.MapFunctions.currentMap);
          
          // Centrer la carte sur la position actuelle
          window.MapFunctions.currentMap.setView([latitude, longitude], 15);
        }
        
        // Mettre à jour l'état du chronomètre
        setChronoGPS(prevState => {
          const newState = {
            ...prevState,
            currentPosition: { lat: latitude, lng: longitude },
            distanceToStart,
            distanceToEnd,
            nearStart,
            nearEnd
          };
          
          // Si on est en attente et qu'on est proche du départ, démarrer le chronomètre
          if (prevState.status === "waiting" && nearStart) {
            newState.status = "running";
            newState.startTime = Date.now();
            newState.currentTime = Date.now();
          }
          
          // Si le chronomètre est en cours et qu'on est proche de l'arrivée, arrêter le chronomètre
          if (prevState.status === "running" && nearEnd) {
            newState.status = "finished";
            newState.endTime = Date.now();
            newState.elapsedTime = newState.endTime - newState.startTime;
            
            // Préparer les données du chrono
            const temps = formatTime(newState.elapsedTime);
            const date = new Date().toISOString().split('T')[0];
            
            // Ajouter le chrono à la liste locale
            const newChrono = {
              utilisateur: prevState.utilisateur,
              courseId: prevState.courseId,
              temps: temps,
              date: date
            };
            
            // Envoyer le chrono au backend
            window.API.createChrono(newChrono)
              .then(response => {
                // Ajouter le nouveau chrono à la liste des chronos avec l'ID généré par le backend
                setChronos(prevChronos => [...prevChronos, {
                  id: response._id,
                  utilisateur: response.utilisateur,
                  courseId: response.courseId,
                  temps: response.temps,
                  date: new Date(response.date).toISOString().split('T')[0]
                }]);
                console.log("Chrono enregistré avec succès!");
              })
              .catch(error => {
                console.error("Erreur lors de l'enregistrement du chrono:", error);
                // En cas d'erreur, ajouter quand même le chrono localement
                setChronos(prevChronos => [...prevChronos, {
                  id: `local-${Date.now()}`,
                  ...newChrono
                }]);
              });
          }
          
          // Si le chronomètre est en cours, mettre à jour le temps écoulé
          if (prevState.status === "running") {
            newState.currentTime = Date.now();
            newState.elapsedTime = newState.currentTime - newState.startTime;
          }
          
          return newState;
        });
      },
      (error) => {
        setChronoGPS(prevState => ({
          ...prevState,
          error: `Erreur de géolocalisation: ${error.message}`,
          status: "idle"
        }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );
    
    // Stocker l'ID du suivi GPS
    setChronoGPS(prevState => ({
      ...prevState,
      watchId
    }));
  };
  
  // Arrêter le suivi GPS
  const stopGPSTracking = () => {
    if (chronoGPS.watchId) {
      navigator.geolocation.clearWatch(chronoGPS.watchId);
    }
    
    setChronoGPS(prevState => ({
      ...prevState,
      status: "idle",
      watchId: null
    }));
  };

  return (
    <div className="container">
      <header>
        <h1>ChronoMontagne</h1>
        <p>Comparez vos temps de course en montagne avec vos amis</p>
        {loading && <div className="loading-indicator">Chargement des données...</div>}
        {error && <div className="error-message">{error}</div>}
        <button className="refresh-button" onClick={refreshData} disabled={loading}>Actualiser les données</button>
      </header>
      
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'chrono' ? 'active' : ''}`}
          onClick={() => changerOnglet('chrono')}
        >
          Ajouter un chrono
        </div>
        <div 
          className={`tab ${activeTab === 'course' ? 'active' : ''}`}
          onClick={() => changerOnglet('course')}
        >
          Ajouter une course
        </div>
        <div 
          className={`tab ${activeTab === 'carte' ? 'active' : ''}`}
          onClick={() => changerOnglet('carte')}
        >
          Définir un tracé
        </div>
        <div 
          className={`tab ${activeTab === 'chrono-gps' ? 'active' : ''}`}
          onClick={() => changerOnglet('chrono-gps')}
        >
          Chronomètre GPS
        </div>
        <div 
          className={`tab ${activeTab === 'classement' ? 'active' : ''}`}
          onClick={() => changerOnglet('classement')}
        >
          Classements
        </div>
      </div>
      
      {activeTab === 'chrono' && (
        <div className="card">
          <h2>Ajouter un nouveau chrono</h2>
          <form onSubmit={ajouterChrono}>
            <div className="form-group">
              <label htmlFor="utilisateur">Votre nom</label>
              <input 
                type="text" 
                id="utilisateur" 
                name="utilisateur" 
                value={nouveauChrono.utilisateur}
                onChange={handleChronoChange}
                placeholder="Ex: Jean Dupont"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="courseId">Course</label>
              <select 
                id="courseId" 
                name="courseId" 
                value={nouveauChrono.courseId}
                onChange={handleChronoChange}
                required
              >
                <option value="">Sélectionnez une course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.nom} ({course.distance} km, D+ {course.denivele}m)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="temps">Temps (format h:mm:ss)</label>
              <input 
                type="text" 
                id="temps" 
                name="temps" 
                value={nouveauChrono.temps}
                onChange={handleChronoChange}
                placeholder="Ex: 2:30:45"
                pattern="[0-9]+:[0-5][0-9]:[0-5][0-9]"
                title="Format: h:mm:ss (ex: 2:30:45)"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input 
                type="date" 
                id="date" 
                name="date" 
                value={nouveauChrono.date}
                onChange={handleChronoChange}
                required
              />
            </div>
            
            <button type="submit">Enregistrer mon chrono</button>
          </form>
        </div>
      )}
      
      {activeTab === 'course' && (
        <div className="card">
          <h2>Ajouter une nouvelle course</h2>
          <p>Définissez d'abord le tracé dans l'onglet "Définir un tracé", puis complétez les informations ici.</p>
          <form onSubmit={ajouterCourse}>
            <div className="form-group">
              <label htmlFor="nom">Nom de la course</label>
              <input 
                type="text" 
                id="nom" 
                name="nom" 
                value={nouvelleCourse.nom}
                onChange={handleCourseChange}
                placeholder="Ex: Trail du Mont Blanc"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="distance">Distance (km)</label>
              <input 
                type="number" 
                id="distance" 
                name="distance" 
                value={nouvelleCourse.distance || routeInfo.distance}
                onChange={handleCourseChange}
                placeholder="Ex: 42"
                step="0.1"
                min="0"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="denivele">Dénivelé positif (m)</label>
              <input 
                type="number" 
                id="denivele" 
                name="denivele" 
                value={nouvelleCourse.denivele}
                onChange={handleCourseChange}
                placeholder="Ex: 2500"
                min="0"
                required
              />
            </div>
            
            {routeInfo.path.length > 0 ? (
              <div className="route-info">
                <div className="route-info-item">
                  <div>Distance calculée</div>
                  <div className="route-info-value">{routeInfo.distance} km</div>
                </div>
                <div className="route-info-item">
                  <div>Points du tracé</div>
                  <div className="route-info-value">{routeInfo.path.length}</div>
                </div>
              </div>
            ) : (
              <p><strong>Aucun tracé défini.</strong> Allez dans l'onglet "Définir un tracé" pour créer un parcours.</p>
            )}
            
            <button type="submit" disabled={routeInfo.path.length < 2}>Ajouter la course</button>
          </form>
        </div>
      )}
      
      {activeTab === 'carte' && (
        <div className="card">
          <h2>Définir le tracé de la course</h2>
          <p>Placez des marqueurs pour définir le parcours. Vous pouvez les déplacer en les faisant glisser.</p>
          
          <div className="map-search">
            <input 
              type="text" 
              placeholder="Rechercher un lieu" 
              value={routeInfo.searchQuery}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress}
            />
            <button className="button-secondary" onClick={handleSearchPlace}>Rechercher</button>
          </div>
          
          <div className="map-controls">
            <button onClick={handleAddStartMarker}>Ajouter départ</button>
            <button onClick={handleAddWaypointMarker}>Ajouter point intermédiaire</button>
            <button onClick={handleAddEndMarker}>Ajouter arrivée</button>
            <button className="button-secondary" onClick={handleClearRoute}>Effacer le tracé</button>
          </div>
          
          <div id="map-container" className="map-container"></div>
          
          {routeInfo.path.length > 0 && (
            <div className="map-info">
              <h3>Informations sur le tracé</h3>
              <div className="route-info">
                <div className="route-info-item">
                  <div>Distance</div>
                  <div className="route-info-value">{routeInfo.distance} km</div>
                </div>
                <div className="route-info-item">
                  <div>Points</div>
                  <div className="route-info-value">{routeInfo.path.length}</div>
                </div>
              </div>
              
              <div className="map-actions">
                <button onClick={() => changerOnglet('course')}>Utiliser ce tracé</button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'chrono-gps' && (
        <div className="card">
          <h2>Chronomètre GPS Automatique</h2>
          <p>Cette fonction utilise votre position GPS pour démarrer et arrêter automatiquement le chronomètre lorsque vous franchissez les points de départ et d'arrivée.</p>
          
          {chronoGPS.error && (
            <div className="error-message">{chronoGPS.error}</div>
          )}
          
          <div className="form-group">
            <label htmlFor="utilisateur-gps">Votre nom</label>
            <input 
              type="text" 
              id="utilisateur-gps" 
              name="utilisateur" 
              value={chronoGPS.utilisateur}
              onChange={handleChronoGPSChange}
              placeholder="Ex: Jean Dupont"
              disabled={chronoGPS.status !== 'idle'}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="courseId-gps">Course</label>
            <select 
              id="courseId-gps" 
              name="courseId" 
              value={chronoGPS.courseId}
              onChange={handleChronoGPSChange}
              disabled={chronoGPS.status !== 'idle'}
              required
            >
              <option value="">Sélectionnez une course</option>
              {courses.filter(course => course.tracePath && course.tracePath.length >= 2).map(course => (
                <option key={course.id} value={course.id}>
                  {course.nom} ({course.distance} km, D+ {course.denivele}m)
                </option>
              ))}
            </select>
          </div>
          
          <div id="gps-map-container" className="map-container"></div>
          
          <div className="chrono-status">
            <div className="status-label">Statut:</div>
            <div className="status-value">
              {chronoGPS.status === 'idle' && "Prêt"}
              {chronoGPS.status === 'waiting' && "En attente du départ..."}
              {chronoGPS.status === 'running' && "Chronomètre en cours..."}
              {chronoGPS.status === 'finished' && "Course terminée!"}
            </div>
          </div>
          
          {(chronoGPS.status === 'waiting' || chronoGPS.status === 'running') && (
            <div className="gps-info">
              {chronoGPS.distanceToStart !== null && (
                <div className="gps-info-item">
                  <div>Distance au départ:</div>
                  <div className="gps-info-value">{Math.round(chronoGPS.distanceToStart)} m</div>
                </div>
              )}
              {chronoGPS.distanceToEnd !== null && (
                <div className="gps-info-item">
                  <div>Distance à l'arrivée:</div>
                  <div className="gps-info-value">{Math.round(chronoGPS.distanceToEnd)} m</div>
                </div>
              )}
            </div>
          )}
          
          {chronoGPS.status === 'running' && (
            <div className="chrono-display">
              <div className="time-label">Temps écoulé:</div>
              <div className="time-value">{formatTime(chronoGPS.elapsedTime)}</div>
            </div>
          )}
          
          {chronoGPS.status === 'finished' && (
            <div className="chrono-result">
              <div className="result-label">Votre temps:</div>
              <div className="result-value">{formatTime(chronoGPS.elapsedTime)}</div>
              <p>Votre chrono a été enregistré!</p>
            </div>
          )}
          
          <div className="chrono-controls">
            {chronoGPS.status === 'idle' && (
              <button type="button" onClick={startGPSTracking}>Démarrer le suivi GPS</button>
            )}
            {(chronoGPS.status === 'waiting' || chronoGPS.status === 'running') && (
              <button type="button" className="button-secondary" onClick={stopGPSTracking}>Annuler</button>
            )}
            {chronoGPS.status === 'finished' && (
              <button onClick={() => {
                setChronoGPS({
                  courseId: "",
                  utilisateur: "",
                  status: "idle",
                  startTime: null,
                  endTime: null,
                  currentTime: null,
                  elapsedTime: 0,
                  watchId: null,
                  currentPosition: null,
                  distanceToStart: null,
                  distanceToEnd: null,
                  nearStart: false,
                  nearEnd: false,
                  error: null
                });
              }}>Nouveau chrono</button>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'classement' && (
        <div className="card">
          <h2>Classements par course</h2>
          
          {courses.map(course => (
            <div key={course.id} style={{marginBottom: '30px'}}>
              <h3>{course.nom} ({course.distance} km, D+ {course.denivele}m)</h3>
              {course.tracePath && course.tracePath.length > 0 && (
                <p><strong>Tracé défini</strong> avec {course.tracePath.length} points</p>
              )}
              
              {trierChronosParTemps(course.id).length > 0 ? (
                <div>
                  {trierChronosParTemps(course.id).map((chrono, index) => (
                    <div 
                      key={chrono.id} 
                      className={`leaderboard-item ${index === 0 ? 'top-rank' : index === 1 ? 'second-rank' : index === 2 ? 'third-rank' : ''}`}
                    >
                      <div className="rank">{index + 1}</div>
                      <div className="user-info">
                        <div><strong>{chrono.utilisateur}</strong></div>
                        <div>Date: {chrono.date}</div>
                      </div>
                      <div className="time">{chrono.temps}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Aucun chrono enregistré pour cette course.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Rendu de l'application dans l'élément root
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
