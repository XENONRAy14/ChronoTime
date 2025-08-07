// Fonction de débogage pour afficher les erreurs
// Ajouter des styles CSS pour le bouton d'actualisation
const refreshButtonStyle = document.createElement('style');
refreshButtonStyle.textContent = `
  .refresh-button {
    background-color: #ff0000;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s, transform 0.2s, box-shadow 0.3s;
    margin: 10px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
  }
  
  .refresh-button:hover {
    background-color: #cc0000;
    transform: scale(1.05);
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.7);
  }
  
  .refresh-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
  }
  
  .refresh-button::before {
    content: '';
    display: inline-block;
    margin-right: 5px;
  }
`;
document.head.appendChild(refreshButtonStyle);

window.onerror = function(message, source, lineno, colno, error) {
  console.error('Erreur JavaScript:', message);
  console.error('Source:', source);
  console.error('Ligne:', lineno);
  console.error('Colonne:', colno);
  console.error('Objet d\'erreur:', error);
  
  // Afficher l'erreur sur la page
  const errorDiv = document.createElement('div');
  errorDiv.style.backgroundColor = '#ffebee';
  errorDiv.style.color = '#d32f2f';
  errorDiv.style.padding = '20px';
  errorDiv.style.margin = '20px';
  errorDiv.style.borderRadius = '8px';
  errorDiv.style.fontFamily = 'Arial, sans-serif';
  errorDiv.innerHTML = `
    <h2>Erreur JavaScript</h2>
    <p><strong>Message:</strong> ${message}</p>
    <p><strong>Source:</strong> ${source}</p>
    <p><strong>Ligne:</strong> ${lineno}</p>
    <p><strong>Colonne:</strong> ${colno}</p>
  `;
  
  // Ajouter au début du body
  document.body.insertBefore(errorDiv, document.body.firstChild);
  
  return true; // Empêcher l'affichage de l'erreur par défaut
};

// Composant principal de l'application
const App = () => {
  // Vérifier si l'utilisateur est déjà connecté
  const [isAuthenticated, setIsAuthenticated] = React.useState(window.API.isAuthenticated());
  const [currentUser, setCurrentUser] = React.useState(window.API.getCurrentUser());
  
  // État pour l'authentification
  const [authTab, setAuthTab] = React.useState('login'); // 'login' ou 'register'
  const [loginForm, setLoginForm] = React.useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = React.useState({ username: '', email: '', password: '', name: '' });
  const [authError, setAuthError] = React.useState(null);
  
  // État pour les statistiques
  const [userStats, setUserStats] = React.useState(null);
  
  // État principal de l'application
  const [activeTab, setActiveTab] = React.useState(isAuthenticated ? 'chrono-gps' : 'auth');
  const [mapInitialized, setMapInitialized] = React.useState(false);
  const [courses, setCourses] = React.useState([]);
  const [chronos, setChronos] = React.useState([]);
  const [myChronos, setMyChronos] = React.useState([]);
  
  // État pour l'administration
  const [allUsers, setAllUsers] = React.useState([]);
  const [adminStats, setAdminStats] = React.useState(null);
  const [adminActionStatus, setAdminActionStatus] = React.useState({ message: '', type: '' });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  // Fonctions de gestion de l'authentification
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError(null);
    
    try {
      const result = await window.API.login(loginForm);
      
      // Forcer le statut admin pour le compte Belho.r
      const user = window.API.getCurrentUser();
      if (user && user.username === 'Belho.r') {
        user.isAdmin = true;
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Statut administrateur activé pour Belho.r');
      }
      
      setIsAuthenticated(true);
      setCurrentUser(user);
      setActiveTab('chrono-gps');
    } catch (error) {
      setAuthError(error.message || 'Erreur de connexion. Veuillez réessayer.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError(null);
    
    try {
      const result = await window.API.register(registerForm);
      setIsAuthenticated(true);
      setCurrentUser(window.API.getCurrentUser());
      setActiveTab('chrono-gps');
      // Recharger les données après inscription
      loadData();
    } catch (error) {
      setAuthError(error.message || 'Erreur d\'inscription. Veuillez réessayer.');
    }
  };

  const handleLogout = () => {
    window.API.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('auth');
  };

  // Charger les données au démarrage de l'application
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger les courses depuis l'API
        const coursesData = await window.API.getCourses();
        
        // Si l'utilisateur est connecté, charger ses chronos personnels
        if (isAuthenticated) {
          try {
            // Récupérer tous les chronos sans filtrage
            const allChronosData = await window.API.getChronos();
            console.log('Tous les chronos récupérés:', allChronosData);
            
            if (allChronosData && allChronosData.length > 0) {
              // Obtenir l'utilisateur actuel
              const currentUser = window.API.getCurrentUser();
              console.log('Utilisateur actuel:', currentUser);
              
              // Filtrer manuellement ici pour plus de contrôle
              let userChronos = [];
              
              if (currentUser && currentUser.username === 'Belho.r') {
                // Pour Belho.r, on prend tous les chronos avec utilisateur = 'Rayan BELHOCINE'
                userChronos = allChronosData.filter(chrono => 
                  chrono.utilisateur === 'Rayan BELHOCINE' || 
                  (chrono.userId && chrono.userId.$oid === '67fbc19e0d0fdd2b0ea86680')
                );
                console.log('Chronos filtrés pour Belho.r:', userChronos);
              } else if (currentUser) {
                // Pour les autres utilisateurs, filtrage standard
                userChronos = allChronosData.filter(chrono => 
                  chrono.utilisateur === currentUser.username ||
                  (chrono.userId && chrono.userId === currentUser._id)
                );
              }
              
              // Formater les chronos pour l'affichage
              const formattedMyChronos = userChronos.map(chrono => ({
                id: chrono._id,
                utilisateur: chrono.utilisateur,
                courseId: chrono.courseId._id,
                temps: chrono.temps,
                date: new Date(chrono.date).toISOString().split('T')[0],
                stats: chrono.stats || {}
              }));
              
              console.log('Chronos formatés pour affichage:', formattedMyChronos);
              setMyChronos(formattedMyChronos);
            } else {
              console.warn('Aucun chrono récupéré depuis l\'API');
            }
          } catch (error) {
            console.error('Erreur lors du chargement des chronos:', error);
          }
          
          // Si l'utilisateur est admin, charger les données d'administration
          const user = window.API.getCurrentUser();
          if (user && user.isAdmin) {
            loadAdminData();
          }
        }
        
        if (coursesData && coursesData.length > 0) {
          console.log('🏁 Courses récupérées depuis l\'API:', coursesData);
          
          // Transformer les données pour correspondre à notre format
          const formattedCourses = coursesData.map(course => {
            console.log(`Course ${course.nom}:`, {
              id: course._id,
              tracePath: course.tracePath,
              hasTracePath: course.tracePath && course.tracePath.length > 0
            });
            
            return {
              id: course._id,
              nom: course.nom,
              distance: course.distance,
              denivele: course.denivele,
              tracePath: course.tracePath
            };
          });
          
          console.log('🗺️ Courses formatées:', formattedCourses);
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
    
    // Charger les données une seule fois au démarrage
    loadData();
    
    // Pas d'actualisation automatique pour éviter les requêtes inutiles
    // L'utilisateur pourra actualiser manuellement avec un bouton
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
              const startIcon = window.MapFunctions.createStartIcon();
              
              const startMarker = L.marker([startPoint.lat, startPoint.lng], {
                draggable: false,
                icon: startIcon
              }).addTo(window.MapFunctions.currentMap);
              startMarker.bindPopup("Départ");
              window.MapFunctions.markers.push(startMarker);
              
              // Ajouter le marqueur d'arrivée
              const endIcon = window.MapFunctions.createEndIcon();
              
              const endMarker = L.marker([endPoint.lat, endPoint.lng], {
                draggable: false,
                icon: endIcon
              }).addTo(window.MapFunctions.currentMap);
              endMarker.bindPopup("Arrivée");
              window.MapFunctions.markers.push(endMarker);
              
              // Ajouter les points intermédiaires
              const waypointIcon = window.MapFunctions.createWaypointIcon();
              
              for (let i = 1; i < selectedCourse.tracePath.length - 1; i++) {
                const point = selectedCourse.tracePath[i];
                const waypointMarker = L.marker([point.lat, point.lng], {
                  draggable: false,
                  icon: waypointIcon
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
      
      // Formatage de la nouvelle course
      const formattedCourse = {
        id: nouvelleCourseComplete._id,
        nom: nouvelleCourseComplete.nom,
        distance: nouvelleCourseComplete.distance,
        denivele: nouvelleCourseComplete.denivele,
        tracePath: nouvelleCourseComplete.tracePath
      };
      
      // Ajout de la nouvelle course à l'état local
      setCourses(prevCourses => [...prevCourses, formattedCourse]);
      
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
      
      console.log("Nouvelle course ajoutée:", formattedCourse);
      
      // Si la course a un tracé valide, la sélectionner automatiquement dans le chronomètre GPS
      if (formattedCourse.tracePath && formattedCourse.tracePath.length >= 2) {
        setChronoGPS(prevState => ({
          ...prevState,
          courseId: formattedCourse.id
        }));
        // Aller à l'onglet chronomètre GPS pour montrer la nouvelle course
        setActiveTab('chrono-gps');
      } else {
        // Sinon, revenir à l'onglet des chronos
        setActiveTab('chrono');
      }
      
      // Afficher un message de confirmation
      alert("Course ajoutée avec succès! " + 
            (formattedCourse.tracePath && formattedCourse.tracePath.length >= 2 ? 
             "Vous êtes maintenant dans l'onglet Chronomètre GPS avec votre nouvelle course sélectionnée." : 
             ""));
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
  
  // Fonction pour obtenir mes chronos en utilisant les mêmes données que celles du classement
  const getMesChronos = () => {
    if (!currentUser) return [];
    
    let mesChronos = [];
    
    // Si l'utilisateur est Belho.r, on sait que son chrono est associé à 'Rayan BELHOCINE'
    if (currentUser.username === 'Belho.r') {
      mesChronos = chronos.filter(chrono => chrono.utilisateur === 'Rayan BELHOCINE');
      console.log('Chronos filtrés pour Belho.r:', mesChronos);
    } else {
      // Pour les autres utilisateurs, on filtre par nom d'utilisateur
      mesChronos = chronos.filter(chrono => chrono.utilisateur === currentUser.username);
    }
    
    return mesChronos;
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
  
  // Variable pour stocker la dernière actualisation
  const [lastRefreshTime, setLastRefreshTime] = React.useState(0);

  // Fonction pour actualiser manuellement les données avec limitation de fréquence
  const refreshData = async (event) => {
    // Vérifier si l'actualisation est trop fréquente (moins de 10 secondes)
    const now = Date.now();
    if (now - lastRefreshTime < 10000) {
      console.log('Actualisation trop fréquente, attente nécessaire...');
      setError('Veuillez patienter quelques secondes avant d\'actualiser à nouveau');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    // Mettre à jour le timestamp de dernière actualisation
    setLastRefreshTime(now);
    
    try {
      setLoading(true);
      
      // Ajouter un paramètre de cache-busting pour éviter les mises en cache
      const cacheBuster = `?_nocache=${now}`;
      
      // Charger les courses depuis l'API
      const coursesData = await fetch(`${window.API.API_URL || 'https://chronotime-api.onrender.com/api'}/courses${cacheBuster}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache, no-store'
        }
      }).then(res => res.json());
      
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
      const chronosData = await fetch(`${window.API.API_URL || 'https://chronotime-api.onrender.com/api'}/chronos${cacheBuster}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache, no-store'
        }
      }).then(res => res.json());
      
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
        const startIcon = window.MapFunctions.createStartIcon();
      
        const marker = L.marker([center.lat, center.lng], {
          draggable: true,
          icon: startIcon
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
        const endIcon = window.MapFunctions.createEndIcon();
        
        const marker = L.marker([center.lat, center.lng], {
          draggable: true,
          icon: endIcon
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
        const waypointIcon = window.MapFunctions.createWaypointIcon();
        
        const marker = L.marker([center.lat, center.lng], {
          draggable: true,
          icon: waypointIcon
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
      console.log('🗺️ Changement de course détecté:', value);
      
      // Trouver la course sélectionnée
      const selectedCourseId = value;
      const selectedCourse = courses.find(c => c.id === selectedCourseId);
      
      console.log('Course sélectionnée:', selectedCourse);
      console.log('Tracé disponible:', selectedCourse && selectedCourse.tracePath);
      
      // Vérifier si la course a un tracé défini
      if (selectedCourse && selectedCourse.tracePath && selectedCourse.tracePath.length >= 2) {
        console.log('✅ Tracé valide trouvé avec', selectedCourse.tracePath.length, 'points');
        
        // Fonction pour afficher le tracé
        const displayCourseTrace = () => {
          console.log('🎯 Tentative d\'affichage du tracé...');
          
          if (!window.MapFunctions) {
            console.error('❌ MapFunctions non disponible');
            return;
          }
          
          if (!window.MapFunctions.currentMap) {
            console.error('❌ Carte non initialisée');
            return;
          }
          
          console.log('✅ Carte disponible, affichage du tracé...');
          
          try {
            // Effacer les marqueurs et tracés existants
            if (window.MapFunctions.clearRoute) {
              window.MapFunctions.clearRoute();
            } else {
              // Méthode alternative de nettoyage
              if (window.MapFunctions.markers) {
                window.MapFunctions.markers.forEach(marker => {
                  window.MapFunctions.currentMap.removeLayer(marker);
                });
                window.MapFunctions.markers = [];
              }
              if (window.MapFunctions.polyline) {
                window.MapFunctions.currentMap.removeLayer(window.MapFunctions.polyline);
                window.MapFunctions.polyline = null;
              }
            }
            
            // Ajouter les marqueurs de départ et d'arrivée
            const startPoint = selectedCourse.tracePath[0];
            const endPoint = selectedCourse.tracePath[selectedCourse.tracePath.length - 1];
            
            console.log('Départ:', startPoint, 'Arrivée:', endPoint);
            
            // Créer les icônes ou utiliser des icônes par défaut
            let startIcon, endIcon, waypointIcon;
            
            try {
              startIcon = window.MapFunctions.createStartIcon();
              endIcon = window.MapFunctions.createEndIcon();
              waypointIcon = window.MapFunctions.createWaypointIcon();
            } catch (iconError) {
              console.warn('Erreur création icônes, utilisation des icônes par défaut');
              startIcon = new L.Icon.Default();
              endIcon = new L.Icon.Default();
              waypointIcon = new L.Icon.Default();
            }
            
            // Ajouter le marqueur de départ
            const startMarker = L.marker([startPoint.lat, startPoint.lng], {
              draggable: false,
              icon: startIcon
            }).addTo(window.MapFunctions.currentMap);
            startMarker.bindPopup("🏁 Départ");
            
            if (!window.MapFunctions.markers) window.MapFunctions.markers = [];
            window.MapFunctions.markers.push(startMarker);
            
            // Ajouter le marqueur d'arrivée
            const endMarker = L.marker([endPoint.lat, endPoint.lng], {
              draggable: false,
              icon: endIcon
            }).addTo(window.MapFunctions.currentMap);
            endMarker.bindPopup("🏆 Arrivée");
            window.MapFunctions.markers.push(endMarker);
            
            // Ajouter les points intermédiaires
            for (let i = 1; i < selectedCourse.tracePath.length - 1; i++) {
              const point = selectedCourse.tracePath[i];
              const waypointMarker = L.marker([point.lat, point.lng], {
                draggable: false,
                icon: waypointIcon
              }).addTo(window.MapFunctions.currentMap);
              waypointMarker.bindPopup(`📍 Point ${i}`);
              window.MapFunctions.markers.push(waypointMarker);
            }
            
            // Utiliser le système de routage existant pour suivre les routes réelles
            window.MapFunctions.updatePolyline();
            
            console.log('✅ Tracé affiché avec succès!');
            
          } catch (error) {
            console.error('❌ Erreur lors de l\'affichage du tracé:', error);
          }
        };
        
        // Détection mobile pour ajuster les délais
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
        
        // Essayer d'afficher le tracé avec plusieurs tentatives (délais plus longs sur mobile)
        let attempts = 0;
        const maxAttempts = isMobile ? 10 : 5;
        
        const tryDisplayTrace = () => {
          attempts++;
          console.log(`🔄 Tentative ${attempts}/${maxAttempts} (Mobile: ${isMobile})`);
          
          // Vérifier si MapFunctions existe
          if (!window.MapFunctions) {
            console.error('❌ MapFunctions non disponible');
            if (attempts < maxAttempts) {
              const delay = isMobile ? 500 * attempts : 200 * attempts;
              setTimeout(tryDisplayTrace, delay);
            }
            return;
          }
          
          console.log('✅ MapFunctions disponible');
          console.log('Carte actuelle:', window.MapFunctions.currentMap);
          
          // Si la carte n'existe pas, essayer de la créer
          if (!window.MapFunctions.currentMap) {
            console.log('🔧 Carte non initialisée, tentative de création...');
            
            // Chercher le conteneur de carte pour chrono-gps
            console.log('🔍 Recherche du conteneur gps-map-container...');
            const mapContainer = document.getElementById('gps-map-container');
            console.log('Conteneur trouvé:', mapContainer);
            
            if (mapContainer) {
              console.log('🎯 Création de la carte pour chrono-gps...');
              try {
                const map = window.MapFunctions.createMap('gps-map-container');
                console.log('✅ Carte créée avec succès!');
                // Attendre un peu que la carte soit prête
                setTimeout(() => {
                  displayCourseTrace();
                }, 500);
                return;
              } catch (error) {
                console.error('❌ Erreur lors de la création de la carte:', error);
              }
            } else {
              console.error('❌ Conteneur gps-map-container non trouvé');
            }
          } else {
            // La carte existe, vérifier qu'elle est prête
            if (window.MapFunctions.currentMap._loaded) {
              displayCourseTrace();
            } else {
              // Attendre que la carte soit chargée
              window.MapFunctions.currentMap.whenReady(() => {
                displayCourseTrace();
              });
            }
            return;
          }
          
          // Si on arrive ici, réessayer
          if (attempts < maxAttempts) {
            const delay = isMobile ? 500 * attempts : 200 * attempts;
            setTimeout(tryDisplayTrace, delay);
          } else {
            console.error('❌ Impossible d\'afficher le tracé après', maxAttempts, 'tentatives');
          }
        };
        
        // Délai initial plus long sur mobile
        const initialDelay = isMobile ? 300 : 100;
        setTimeout(tryDisplayTrace, initialDelay);
        
      } else {
        console.warn('⚠️ Aucun tracé valide pour cette course');
        
        // Sur mobile, essayer de forcer un refresh de la carte
        const isMobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
        if (isMobileCheck && window.MapFunctions && window.MapFunctions.currentMap) {
          setTimeout(() => {
            window.MapFunctions.currentMap.invalidateSize();
          }, 500);
        }
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
  
  // Calculer la vitesse actuelle en km/h
  const calculateSpeed = (distance, time) => {
    if (!distance || !time) return 0;
    
    // Convertir la distance en km et le temps en heures
    const distanceKm = distance / 1000;
    const timeHours = time / (1000 * 60 * 60);
    
    // Calculer la vitesse en km/h
    return distanceKm / timeHours;
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
    
    // Vérifier si l'utilisateur est connecté
    if (!isAuthenticated || !currentUser) {
      setChronoGPS(prevState => ({
        ...prevState,
        error: "Vous devez être connecté pour utiliser le chronomètre GPS.",
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
        
        // Vérifier si nous sommes en mode simulateur
        const isSimulatorActive = window.GPSSimulator && window.GPSSimulator.isActive;
        const simulatorPhase = isSimulatorActive ? window.GPSSimulator.testPhase : null;
        
        // Calculer la distance jusqu'au point de départ et d'arrivée
        const distanceToStart = calculateDistance(latitude, longitude, startPoint.lat, startPoint.lng);
        const distanceToEnd = calculateDistance(latitude, longitude, endPoint.lat, endPoint.lng);
        
        // En mode simulateur, forcer la détection de proximité selon la phase
        let nearStart, nearEnd;
        
        if (isSimulatorActive && simulatorPhase) {
          // Forcer la détection selon la phase du simulateur
          nearStart = simulatorPhase === 'start';
          nearEnd = simulatorPhase === 'end';
          console.log(`Simulation GPS: Phase ${simulatorPhase}, nearStart=${nearStart}, nearEnd=${nearEnd}`);
        } else {
          // Détection normale basée sur la distance
          nearStart = distanceToStart !== null && distanceToStart < 100;
          nearEnd = distanceToEnd !== null && distanceToEnd < 100;
        }
        
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
            
            // Calculer la vitesse moyenne et la vitesse maximum
            const selectedCourse = courses.find(c => c.id === prevState.courseId);
            const distanceKm = selectedCourse ? selectedCourse.distance : 0;
            const timeHours = newState.elapsedTime / (1000 * 60 * 60); // Convertir ms en heures
            
            // Vitesse moyenne en km/h
            const vitesseMoyenne = distanceKm / timeHours;
            
            // Vitesse maximum (utiliser la vitesse maximale enregistrée pendant la course)
            const vitesseMaximum = Math.max(prevState.vitesseMaximum || 0, prevState.vitesseActuelle || 0);
            
            // Mettre à jour les statistiques
            newState.vitesseMoyenne = vitesseMoyenne.toFixed(1);
            newState.vitesseMaximum = vitesseMaximum.toFixed(1);
            
            // Préparer les données du chrono
            const temps = formatTime(newState.elapsedTime);
            const date = new Date().toISOString().split('T')[0];
            
            // Ajouter le chrono à la liste locale avec les statistiques de vitesse
            const newChrono = {
              // Utiliser uniquement le nom d'utilisateur comme pseudo
              utilisateur: (currentUser && currentUser.username) || '',
              courseId: prevState.courseId,
              temps: temps,
              date: date,
              stats: {
                vitesseMoyenne: newState.vitesseMoyenne,
                vitesseMaximum: newState.vitesseMaximum
              }
            };
            
            console.log("Chrono terminé avec vitesse moyenne: " + newState.vitesseMoyenne + " km/h et vitesse maximum: " + newState.vitesseMaximum + " km/h");
            
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
          
          // Si le chronomètre est en cours, mettre à jour le temps écoulé et calculer la vitesse actuelle
          if (prevState.status === "running") {
            newState.currentTime = Date.now();
            newState.elapsedTime = newState.currentTime - newState.startTime;
            
            // Calculer la vitesse actuelle si on a une position précédente
            if (prevState.lastPosition && prevState.lastTime) {
              const timeDiff = Date.now() - prevState.lastTime; // en ms
              const distance = calculateDistance(
                latitude, longitude,
                prevState.lastPosition.lat, prevState.lastPosition.lng
              );
              
              if (distance && timeDiff > 0) {
                const speed = calculateSpeed(distance, timeDiff);
                newState.vitesseActuelle = speed;
                
                // Mettre à jour la vitesse maximum si nécessaire
                if (speed > (prevState.vitesseMaximum || 0)) {
                  newState.vitesseMaximum = speed;
                }
              }
            }
            
            // Mettre à jour la dernière position et le dernier temps
            newState.lastPosition = { lat: latitude, lng: longitude };
            newState.lastTime = Date.now();
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
        <h1>HOONIGAN.06</h1>
        <p>Street Racing Timers <span className="japanese">ストリートレーシングタイマー</span></p>
        <div className="retro-decoration"></div>
        {loading && <div className="loading-indicator">Chargement des données...</div>}
        {error && <div className="error-message">{error}</div>}
      </header>
      
      <div className="tabs">
        {isAuthenticated ? (
          <div className="tab-group">
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
            <div 
              className={`tab ${activeTab === 'statistiques' ? 'active' : ''}`}
              onClick={() => changerOnglet('statistiques')}
            >
              Mes Statistiques
            </div>
            {currentUser && currentUser.isAdmin && (
              <div 
                className={`tab ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => changerOnglet('admin')}
              >
                Administration
              </div>
            )}
            <div 
              className={`tab ${activeTab === 'cgu' ? 'active' : ''}`}
              onClick={() => changerOnglet('cgu')}
            >
              CGU
            </div>
            <div className="user-info">
              <span>{currentUser && (currentUser.name || currentUser.username) || ''}</span>
              <button className="logout-button" onClick={handleLogout}>Déconnexion</button>
            </div>
          </div>
        ) : (
          <div 
            className={`tab ${activeTab === 'auth' ? 'active' : ''}`}
            onClick={() => changerOnglet('auth')}
          >
            Connexion / Inscription
          </div>
        )}
      </div>
      
      {/* Formulaires d'authentification */}
      {activeTab === 'auth' && (
        <div className="card">
          <div className="auth-tabs">
            <div 
              className={`auth-tab ${authTab === 'login' ? 'active' : ''}`}
              onClick={() => setAuthTab('login')}
            >
              Connexion
            </div>
            <div 
              className={`auth-tab ${authTab === 'register' ? 'active' : ''}`}
              onClick={() => setAuthTab('register')}
            >
              Inscription
            </div>
          </div>
          
          {authError && (
            <div className="auth-error">{authError}</div>
          )}
          
          {authTab === 'login' ? (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="username">Nom d'utilisateur</label>
                <input 
                  type="text" 
                  id="username" 
                  name="username" 
                  value={loginForm.username}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Mot de passe</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              
              <button type="submit">Se connecter</button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label htmlFor="reg-username">Nom d'utilisateur</label>
                <input 
                  type="text" 
                  id="reg-username" 
                  name="username" 
                  value={registerForm.username}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="reg-email">Email</label>
                <input 
                  type="email" 
                  id="reg-email" 
                  name="email" 
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="reg-name">Nom complet</label>
                <input 
                  type="text" 
                  id="reg-name" 
                  name="name" 
                  value={registerForm.name}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="reg-password">Mot de passe</label>
                <input 
                  type="password" 
                  id="reg-password" 
                  name="password" 
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  required
                  minLength="6"
                />
              </div>
              
              <button type="submit">S'inscrire</button>
            </form>
          )}
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
              value={(currentUser && (currentUser.name || currentUser.username)) || ""}
              disabled={true}
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
                  utilisateur: (currentUser && currentUser.name) || (currentUser && currentUser.username) || "",
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
      
      {/* Onglet des statistiques personnelles */}
      {activeTab === 'statistiques' && (
        <div className="card">
          <h2>Mes Statistiques</h2>
          
          {getMesChronos().length > 0 ? (
            <div className="stats-container">
              <div className="stats-summary">
                <h3>Résumé</h3>
                <div className="stats-grid">
                  <div className="stats-item">
                    <div className="stats-label">Courses terminées</div>
                    <div className="stats-value">{getMesChronos().length}</div>
                  </div>
                  <div className="stats-item">
                    <div className="stats-label">Courses uniques</div>
                    <div className="stats-value">
                      {new Set(getMesChronos().map(chrono => chrono.courseId)).size}
                    </div>
                  </div>
                  <div className="stats-item">
                    <div className="stats-label">Meilleur classement</div>
                    <div className="stats-value">
                      {Math.min(
                        ...getMesChronos().map(myChrono => {
                          const position = trierChronosParTemps(myChrono.courseId)
                            .findIndex(chrono => chrono.id === myChrono.id);
                          return position >= 0 ? position + 1 : Infinity;
                        })
                      ) === Infinity ? '-' : Math.min(
                        ...getMesChronos().map(myChrono => {
                          const position = trierChronosParTemps(myChrono.courseId)
                            .findIndex(chrono => chrono.id === myChrono.id);
                          return position >= 0 ? position + 1 : Infinity;
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <h3>Mes Performances</h3>
              <div className="my-chronos-list">
                {getMesChronos().map(chrono => {
                  const course = courses.find(c => c.id === chrono.courseId) || { nom: 'Course inconnue', distance: 0, denivele: 0 };
                  const position = trierChronosParTemps(chrono.courseId)
                    .findIndex(c => c.id === chrono.id) + 1;
                  const totalParticipants = trierChronosParTemps(chrono.courseId).length;
                  
                  // Calcul des statistiques de vitesse
                  const tempsEnSecondes = convertirTempsEnSecondes(chrono.temps);
                  const vitesseMoyenne = course.distance > 0 ? (course.distance / (tempsEnSecondes / 3600)).toFixed(1) : 0;
                  
                  // S'assurer que les statistiques existent
                  if (!chrono.stats) {
                    chrono.stats = {};
                  }
                  
                  // Utiliser la vitesse maximum si disponible, sinon l'estimer
                  if (!chrono.stats.vitesseMaximum && !chrono.stats.vitesseMax) {
                    // Estimer la vitesse maximum comme 1.5x la vitesse moyenne
                    chrono.stats.vitesseMaximum = parseFloat((parseFloat(vitesseMoyenne) * 1.5).toFixed(1));
                  }
                  
                  return (
                    <div key={chrono.id} className="my-chrono-item">
                      <div className="chrono-header">
                        <h4>{course.nom}</h4>
                        <div className="chrono-date">{chrono.date}</div>
                      </div>
                      
                      <div className="chrono-details">
                        <div className="chrono-detail-item">
                          <div className="detail-label">Temps</div>
                          <div className="detail-value">{chrono.temps}</div>
                        </div>
                        <div className="chrono-detail-item">
                          <div className="detail-label">Position</div>
                          <div className="detail-value">{position} / {totalParticipants}</div>
                        </div>
                        <div className="chrono-detail-item">
                          <div className="detail-label">Vitesse moyenne</div>
                          <div className="detail-value">{vitesseMoyenne} km/h</div>
                        </div>
                        <div className="chrono-detail-item">
                          <div className="detail-label">Vitesse maximum</div>
                          <div className="detail-value">{parseFloat(chrono.stats.vitesseMaximum || chrono.stats.vitesseMax || 0) || parseFloat((parseFloat(vitesseMoyenne) * 1.5).toFixed(1))} km/h</div>
                        </div>
                      </div>
                      
                      {chrono.stats && (
                        <div className="chrono-stats">
                          <h5>Statistiques détaillées</h5>
                          <div className="stats-grid">
                            {(chrono.stats.vitesseMaximum > 0 || chrono.stats.vitesseMax > 0) && (
                              <div className="stats-item">
                                <div className="stats-label">Vitesse max</div>
                                <div className="stats-value">{parseFloat(chrono.stats.vitesseMaximum || chrono.stats.vitesseMax || 0).toFixed(1) || parseFloat((parseFloat(vitesseMoyenne) * 1.5).toFixed(1))} km/h</div>
                              </div>
                            )}
                            {chrono.stats.denivelePositif > 0 && (
                              <div className="stats-item">
                                <div className="stats-label">Dénivelé +</div>
                                <div className="stats-value">{chrono.stats.denivelePositif} m</div>
                              </div>
                            )}
                            {chrono.stats.deniveleNegatif > 0 && (
                              <div className="stats-item">
                                <div className="stats-label">Dénivelé -</div>
                                <div className="stats-value">{chrono.stats.deniveleNegatif} m</div>
                              </div>
                            )}
                            {chrono.stats.altitudeMax > 0 && (
                              <div className="stats-item">
                                <div className="stats-label">Altitude max</div>
                                <div className="stats-value">{chrono.stats.altitudeMax} m</div>
                              </div>
                            )}
                            {chrono.stats.frequenceCardiaqueMax > 0 && (
                              <div className="stats-item">
                                <div className="stats-label">FC max</div>
                                <div className="stats-value">{chrono.stats.frequenceCardiaqueMax} bpm</div>
                              </div>
                            )}
                            {chrono.stats.frequenceCardiaqueMoyenne > 0 && (
                              <div className="stats-item">
                                <div className="stats-label">FC moyenne</div>
                                <div className="stats-value">{chrono.stats.frequenceCardiaqueMoyenne} bpm</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="empty-stats">
              <p>Vous n'avez pas encore enregistré de chronos.</p>
              <p>Utilisez le Chronomètre GPS pour enregistrer vos performances lors de vos courses.</p>
              <button onClick={() => changerOnglet('chrono-gps')} className="cta-button">Utiliser le Chronomètre GPS</button>
            </div>
          )}
        </div>
      )}
      
      {/* Interface d'administration */}
      {activeTab === 'admin' && currentUser && currentUser.isAdmin && (
        <div className="card">
          <h2>Administration</h2>
          <p>Gérez les utilisateurs et consultez les statistiques de l'application.</p>
          
          {/* Affichage des messages d'action */}
          {adminActionStatus.message && (
            <div className={`admin-message ${adminActionStatus.type}`}>
              {adminActionStatus.message}
              <button 
                className="close-button" 
                onClick={() => setAdminActionStatus({ message: '', type: '' })}
              >
                ×
              </button>
            </div>
          )}
          
          {/* Statistiques d'administration */}
          <div className="admin-section">
            <h3>Statistiques</h3>
            <button 
              className="refresh-button" 
              onClick={async () => {
                // Désactiver le bouton pendant le chargement
                const button = event.currentTarget;
                button.disabled = true;
                button.textContent = 'Actualisation en cours...';
                
                try {
                  // Vérifier si la dernière actualisation date de moins de 10 secondes
                  const lastRefresh = button.getAttribute('data-last-refresh');
                  const now = Date.now();
                  
                  if (lastRefresh && now - parseInt(lastRefresh) < 10000) {
                    console.log('Actualisation trop fréquente, attente de quelques secondes...');
                    setAdminActionStatus({ message: 'Actualisation trop fréquente, patientez quelques secondes', type: 'warning' });
                    setTimeout(() => {
                      button.disabled = false;
                      button.textContent = '🔄 Actualiser les statistiques';
                    }, 2000);
                    return;
                  }
                  
                  // Ajout d'un paramètre de cache-busting pour forcer le rafraîchissement
                  const timestamp = now;
                  button.setAttribute('data-last-refresh', timestamp.toString());
                  
                  // Appel direct à l'API sans passer par AdminFunctions
                  const response = await fetch(`${window.API.API_URL || 'https://chronotime-api.onrender.com/api'}/admin/stats?_nocache=${timestamp}`, {
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('token')}`,
                      'Cache-Control': 'no-cache, no-store, must-revalidate',
                      'Pragma': 'no-cache'
                    },
                    cache: 'no-store'
                  });
                  
                  if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                  }
                  
                  const statsData = await response.json();
                  console.log('Statistiques fraîches reçues:', statsData);
                  
                  setAdminStats(statsData);
                  setAdminActionStatus({ message: 'Statistiques mises à jour en temps réel', type: 'success' });
                } catch (error) {
                  console.error('Erreur lors du rafraîchissement des statistiques:', error);
                  setAdminActionStatus({ message: `Erreur: ${error.message}`, type: 'error' });
                } finally {
                  // Réactiver le bouton après le chargement
                  setTimeout(() => {
                    button.disabled = false;
                    button.textContent = '🔄 Actualiser les statistiques';
                  }, 1000);
                }
              }}
            >
              ⚡️ Actualiser les statistiques (TEMPS RÉEL)
            </button>
            
            {adminStats ? (
              <div className="admin-stats-grid">
                <div className="admin-stats-item">
                  <div className="stats-label">Utilisateurs inscrits</div>
                  <div className="stats-value">{adminStats.totalUsers}</div>
                </div>
                <div className="admin-stats-item">
                  <div className="stats-label">Administrateurs</div>
                  <div className="stats-value">{adminStats.totalAdmins}</div>
                </div>
              </div>
            ) : (
              <p>Aucune statistique disponible. Cliquez sur "Actualiser les statistiques".</p>
            )}
          </div>
          
          {/* Gestion des utilisateurs */}
          <div className="admin-section">
            <h3>Gestion des utilisateurs</h3>
            <div className="admin-buttons-row">
              <button 
                className="refresh-button" 
                onClick={async () => {
                  try {
                    setAdminActionStatus({ message: 'Actualisation directe depuis le backend...', type: 'info' });
                    
                    // Requête directe au backend sans aucun intermédiaire
                    const response = await fetch('https://chronotime-api.onrender.com/api/admin/debug');
                    if (!response.ok) {
                      throw new Error(`Erreur HTTP: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    console.log('Données brutes reçues du serveur:', data);
                    
                    if (data && data.users && data.users.length > 0) {
                      // Utiliser directement les données de la base de données sans aucune modification
                      setAllUsers(data.users);
                      setAdminActionStatus({ 
                        message: `Liste actualisée: ${data.users.length} utilisateurs`, 
                        type: 'success' 
                      });
                    } else {
                      setAdminActionStatus({ message: 'Aucun utilisateur trouvé dans la réponse', type: 'warning' });
                    }
                  } catch (error) {
                    console.error('Erreur lors de l\'actualisation des utilisateurs:', error);
                    setAdminActionStatus({ message: `Erreur: ${error.message}`, type: 'error' });
                  }
                }}
              >
                🔄 Actualiser la liste
              </button>
              
              <button 
                className="refresh-button force-button" 
                style={{
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  fontWeight: 'bold',
                  marginLeft: '10px'
                }}
                onClick={async () => {
                  try {
                    setAdminActionStatus({ message: 'ACTUALISATION ULTRA-DIRECTE en cours...', type: 'info' });
                    
                    // Méthode DIRECTE sans passer par aucune API
                    console.log('Début récupération ULTRA-DIRECTE des utilisateurs...');
                    
                    // Requête directe au backend sans aucun intermédiaire
                    const response = await fetch('https://chronotime-api.onrender.com/api/admin/debug');
                    if (!response.ok) {
                      throw new Error(`Erreur HTTP: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    console.log('Données brutes reçues du serveur (FORCE):', data);
                    
                    if (data && data.users && data.users.length > 0) {
                      // Utiliser directement les données de la base de données sans aucune modification
                      setAllUsers(data.users);
                      setAdminActionStatus({ 
                        message: `SUCCÈS! ${data.users.length} utilisateurs récupérés.`, 
                        type: 'success' 
                      });
                    } else {
                      setAdminActionStatus({ 
                        message: 'Aucun utilisateur trouvé dans la réponse directe du serveur.', 
                        type: 'warning' 
                      });
                    }
                  } catch (error) {
                    console.error('Erreur lors de l\'actualisation forcée:', error);
                    setAdminActionStatus({ 
                      message: `Erreur lors de l'actualisation forcée: ${error.message}. Vérifiez la console.`, 
                      type: 'error' 
                    });
                  }
                }}
              >
                ⚡ ACTUALISATION FORCÉE (TEMPS RÉEL)
              </button>
            </div>
            

            
            {allUsers.length > 0 ? (
              <div className="users-list">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Nom d'utilisateur</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Date d'inscription</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user, index) => (
                      <tr key={user.id || user._id || index} className={(user.id || user._id) === currentUser.id ? 'current-user' : ''}>
                        <td>{user.name || user.username || 'Sans nom'}</td>
                        <td>{user.username || 'Non défini'}</td>
                        <td>{user.email || 'Non défini'}</td>
                        <td>
                          {/* Afficher le statut exact sans transformation */}
                          {String(user.isAdmin) === 'true' ? 'Administrateur' : 'Utilisateur'}
                          {/* Afficher la valeur brute pour débogage */}
                          <span style={{ fontSize: '8px', color: '#999', display: 'block' }}>
                            (Valeur brute: {JSON.stringify(user.isAdmin)})
                          </span>
                        </td>
                        <td>
                          {/* Utiliser le champ formaté si disponible, sinon essayer de formater nous-mêmes */}
                          {user.createdAtFormatted || 
                           (user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Date inconnue')}
                          
                          {/* Afficher la valeur brute pour débogage */}
                          <span style={{ fontSize: '8px', color: '#999', display: 'block' }}>
                            (Valeur brute: {JSON.stringify(user.createdAt)})
                          </span>
                        </td>
                        <td className="actions-cell">
                          {(user.id || user._id) !== currentUser.id ? (
                            <button 
                              key={`delete-${user.id || user._id}`}
                              className="delete-button"
                              onClick={async () => {
                                try {
                                  // Utiliser l'ID dans le bon format
                                  const userId = user.id || user._id;
                                  console.log(`Tentative de suppression directe de l'utilisateur (${user.username}) avec ID: ${userId}`);
                                  
                                  // Utiliser une requête directe à l'API sans passer par AdminFunctions
                                  const response = await fetch(`https://chronotime-api.onrender.com/api/admin/users/${userId}`, {
                                    method: 'DELETE',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                                    }
                                  });
                                  
                                  // Vérifier si la réponse est OK avant de la parser
                                  if (!response.ok) {
                                    throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
                                  }
                                  
                                  const result = await response.json();
                                  console.log('Résultat suppression:', result);
                                  
                                  if (result.success) {
                                    setAdminActionStatus({ message: 'Utilisateur supprimé avec succès!', type: 'success' });
                                    // Recharger la liste des utilisateurs avec notre méthode fiable
                                    const updatedUsers = await window.API.forceReloadUsers();
                                    if (updatedUsers) {
                                      setAllUsers(updatedUsers);
                                    }
                                    
                                    // Rafraîchir également les statistiques
                                    try {
                                      const timestamp = new Date().getTime();
                                      const statsResponse = await fetch((window.API.API_URL || 'https://chronotime-api.onrender.com/api') + '/admin/stats?_nocache=' + timestamp, {
                                        headers: {
                                          'Authorization': 'Bearer ' + localStorage.getItem('token'),
                                          'Cache-Control': 'no-cache, no-store'
                                        }
                                      });
                                      
                                      if (statsResponse.ok) {
                                        const freshStats = await statsResponse.json();
                                        setAdminStats(freshStats);
                                        console.log('Statistiques mises à jour après suppression:', freshStats);
                                      }
                                    } catch (statsError) {
                                      console.warn('Erreur lors de la mise à jour des statistiques après suppression:', statsError);
                                    }
                                  } else {
                                    setAdminActionStatus({ message: result.message || 'Erreur lors de la suppression', type: 'error' });
                                  }
                                } catch (error) {
                                  console.error('Erreur lors de la suppression:', error);
                                  setAdminActionStatus({ message: 'Erreur technique lors de la suppression', type: 'error' });
                                }
                              }}
                            >
                              Supprimer
                            </button>
                          ) : null}
                          
                          {!user.isAdmin && (user.id || user._id) !== currentUser.id ? (
                            <button 
                              key={`promote-${user.id || user._id}`}
                              className="promote-button"
                              onClick={async () => {
                                try {
                                  // Utiliser l'ID dans le bon format
                                  const userId = user.id || user._id;
                                  console.log(`Tentative de promotion directe de l'utilisateur (${user.username}) avec ID: ${userId}`);
                                  
                                  // Utiliser une requête directe à l'API sans passer par AdminFunctions
                                  const response = await fetch(`https://chronotime-api.onrender.com/api/admin/users/${userId}/promote`, {
                                    method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                                    }
                                  });
                                  
                                  // Vérifier si la réponse est OK avant de la parser
                                  if (!response.ok) {
                                    throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
                                  }
                                  
                                  const result = await response.json();
                                  console.log('Résultat promotion:', result);
                                  
                                  if (result.success) {
                                    setAdminActionStatus({ message: 'Utilisateur promu avec succès!', type: 'success' });
                                    // Recharger la liste des utilisateurs avec notre méthode fiable
                                    const updatedUsers = await window.API.forceReloadUsers();
                                    if (updatedUsers) {
                                      setAllUsers(updatedUsers);
                                    }
                                    
                                    // Rafraîchir également les statistiques
                                    try {
                                      const timestamp = new Date().getTime();
                                      const statsResponse = await fetch(`${window.API.API_URL || 'https://chronotime-api.onrender.com/api'}/admin/stats?_nocache=${timestamp}`, {
                                        headers: {
                                          'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                          'Cache-Control': 'no-cache, no-store'
                                        }
                                      });
                                      
                                      if (statsResponse.ok) {
                                        const freshStats = await statsResponse.json();
                                        setAdminStats(freshStats);
                                        console.log('Statistiques mises à jour après promotion:', freshStats);
                                      }
                                    } catch (statsError) {
                                      console.warn('Erreur lors de la mise à jour des statistiques après promotion:', statsError);
                                    }
                                  } else {
                                    setAdminActionStatus({ message: result.message || 'Erreur lors de la promotion', type: 'error' });
                                  }
                                } catch (error) {
                                  console.error('Erreur lors de la promotion:', error);
                                  setAdminActionStatus({ message: 'Erreur technique lors de la promotion', type: 'error' });
                                }
                              }}
                            >
                              Promouvoir
                            </button>
                          ) : null}
                          
                          {user.isAdmin && (user.id || user._id) !== currentUser.id ? (
                            <button 
                              key={`demote-${user.id || user._id}`}
                              className="demote-button"
                              onClick={async () => {
                                try {
                                  // Utiliser l'ID dans le bon format
                                  const userId = user.id || user._id;
                                  console.log(`Tentative de rétrogradation directe de l'utilisateur (${user.username}) avec ID: ${userId}`);
                                  
                                  // Utiliser une requête directe à l'API sans passer par AdminFunctions
                                  const response = await fetch(`https://chronotime-api.onrender.com/api/admin/users/${userId}/demote`, {
                                    method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                                    }
                                  });
                                  
                                  // Vérifier si la réponse est OK avant de la parser
                                  if (!response.ok) {
                                    throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
                                  }
                                  
                                  const result = await response.json();
                                  console.log('Résultat rétrogradation:', result);
                                  
                                  if (result.success) {
                                    setAdminActionStatus({ message: 'Utilisateur rétrogradé avec succès!', type: 'success' });
                                    // Recharger la liste des utilisateurs avec notre méthode fiable
                                    const updatedUsers = await window.API.forceReloadUsers();
                                    if (updatedUsers) {
                                      setAllUsers(updatedUsers);
                                    }
                                    
                                    // Rafraîchir également les statistiques
                                    try {
                                      const timestamp = new Date().getTime();
                                      const statsResponse = await fetch(`${window.API.API_URL || 'https://chronotime-api.onrender.com/api'}/admin/stats?_nocache=${timestamp}`, {
                                        headers: {
                                          'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                          'Cache-Control': 'no-cache, no-store'
                                        }
                                      });
                                      
                                      if (statsResponse.ok) {
                                        const freshStats = await statsResponse.json();
                                        setAdminStats(freshStats);
                                        console.log('Statistiques mises à jour après rétrogradation:', freshStats);
                                      }
                                    } catch (statsError) {
                                      console.warn('Erreur lors de la mise à jour des statistiques après rétrogradation:', statsError);
                                    }
                                  } else {
                                    setAdminActionStatus({ message: result.message || 'Erreur lors de la rétrogradation', type: 'error' });
                                  }
                                } catch (error) {
                                  console.error('Erreur lors de la rétrogradation:', error);
                                  setAdminActionStatus({ message: 'Erreur technique lors de la rétrogradation', type: 'error' });
                                }
                              }}
                            >
                              Rétrograder
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Aucun utilisateur trouvé. Cliquez sur "Actualiser la liste".</p>
            )}
          </div>
          
          {/* Gestion de la base de données */}
          <div className="admin-section">
            <h3>Gestion de la base de données</h3>
            <p>Utilisez ces fonctions avec précaution. Elles peuvent affecter l'intégrité des données.</p>
            
            <div className="admin-actions">
              <button 
                className="danger-button"
                onClick={() => {
                  if (confirm('Êtes-vous sûr de vouloir nettoyer les chronos orphelins ? Cette action supprimera tous les chronos dont la course associée n\'existe plus.')) {
                    // Cette fonctionnalité nécessiterait une API côté serveur
                    setAdminActionStatus({ message: 'Fonctionnalité non implémentée', type: 'warning' });
                  }
                }}
              >
                Nettoyer les chronos orphelins
              </button>
              
              <button 
                className="danger-button"
                onClick={() => {
                  if (confirm('Êtes-vous sûr de vouloir optimiser la base de données ? Cette action peut prendre du temps.')) {
                    // Cette fonctionnalité nécessiterait une API côté serveur
                    setAdminActionStatus({ message: 'Fonctionnalité non implémentée', type: 'warning' });
                  }
                }}
              >
                Optimiser la base de données
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Onglet CGU */}
      {activeTab === 'cgu' && (
        <div className="card">
          <h2>Conditions Générales d'Utilisation</h2>
          
          <div className="cgu-content">
            <div className="cgu-section">
              <h3>🏁 1. OBJET DE L'APPLICATION</h3>
              <p>ChronoTime est une application de chronométrage dédiée aux courses automobiles sur terrain privé.</p>
              <p><strong>USAGE EXCLUSIVEMENT PRIVÉ - TERRAIN PRIVÉ UNIQUEMENT</strong></p>
            </div>
            
            <div className="cgu-section">
              <h3>⚠️ 2. RESPONSABILITÉ ET RISQUES</h3>
              <p><strong>LE DÉVELOPPEUR DÉCLINE TOUTE RESPONSABILITÉ :</strong></p>
              <ul>
                <li>Accidents, blessures ou dommages matériels</li>
                <li>Utilisation sur voie publique (INTERDITE)</li>
                <li>Non-respect du code de la route</li>
                <li>Précision des données GPS</li>
                <li>Dysfonctionnements techniques</li>
              </ul>
            </div>
            
            <div className="cgu-section">
              <h3>📱 3. UTILISATION GPS</h3>
              <p><strong>AVERTISSEMENTS GPS :</strong></p>
              <ul>
                <li>La géolocalisation peut être imprécise</li>
                <li>Ne pas se fier uniquement au GPS</li>
                <li>Vérifier visuellement votre environnement</li>
                <li>Garder les mains libres pour la conduite</li>
              </ul>
            </div>
            
            <div className="cgu-section">
              <h3>🎯 4. CONDITIONS D'USAGE</h3>
              <p><strong>L'utilisateur s'engage à :</strong></p>
              <ul>
                <li>Utiliser l'application UNIQUEMENT sur terrain privé</li>
                <li>Respecter toutes les réglementations locales</li>
                <li>Porter les équipements de sécurité appropriés</li>
                <li>Ne pas utiliser sur voie publique</li>
                <li>Avoir les autorisations nécessaires du propriétaire du terrain</li>
              </ul>
            </div>
            
            <div className="cgu-section">
              <h3>👥 5. DONNÉES PERSONNELLES</h3>
              <p><strong>Collecte et utilisation :</strong></p>
              <ul>
                <li>Données de géolocalisation pour le chronométrage</li>
                <li>Informations de compte (nom, email)</li>
                <li>Chronométrages et statistiques</li>
                <li>Aucune vente à des tiers</li>
                <li>Stockage sécurisé</li>
              </ul>
            </div>
            
            <div className="cgu-section">
              <h3>⚖️ 6. JURIDICTION</h3>
              <p><strong>Droit applicable :</strong></p>
              <ul>
                <li>Ces conditions sont régies par le droit français</li>
                <li>Tout litige relève des tribunaux français</li>
                <li>En cas de nullité d'une clause, les autres restent valides</li>
              </ul>
            </div>
            
            <div className="cgu-warning">
              <h3>⚠️ RAPPEL IMPORTANT</h3>
              <p className="warning-text">
                <strong>CETTE APPLICATION EST DESTINÉE EXCLUSIVEMENT À UN USAGE PRIVÉ SUR TERRAIN PRIVÉ.</strong><br/>
                <strong>TOUTE UTILISATION SUR VOIE PUBLIQUE EST STRICTEMENT INTERDITE.</strong><br/>
                <strong>LE DÉVELOPPEUR NE PEUT ÊTRE TENU RESPONSABLE DES CONSÉQUENCES DE L'UTILISATION DE CETTE APPLICATION.</strong>
              </p>
            </div>
            
            <div className="cgu-footer">
              <p><em>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</em></p>
              <p><em>Version : 2.0</em></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Rendu de l'application dans l'élément root
ReactDOM.render(<App />, document.getElementById('root'));
