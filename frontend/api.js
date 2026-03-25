// API pour communiquer avec le backend
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const API_URL = isProduction 
  ? 'https://chronotime-api.onrender.com/api' 
  : `${window.location.protocol}//${window.location.hostname}:9000/api`;

// Forcer une nouvelle connexion à chaque requête
const forceNoCache = true;

// Afficher l'URL de l'API pour le débogage
console.log('API URL:', API_URL);

// Fonction utilitaire pour gérer les réponses JSON de manière sécurisée
async function safeJsonParse(response, defaultValue = null) {
  try {
    const text = await response.text();
    if (!text || text.trim() === '' || text === 'undefined') {
      console.warn('Réponse vide ou invalide du serveur');
      return defaultValue;
    }
    return JSON.parse(text);
  } catch (error) {
    console.error('Erreur lors du parsing JSON:', error);
    return defaultValue;
  }
}

// Récupérer le token d'authentification du localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Ajouter le token d'authentification aux en-têtes
function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

// Fonction pour récupérer toutes les courses
async function getCourses() {
  try {
    const response = await fetch(`${API_URL}/courses`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des courses');
    }
    const text = await response.text();
    if (!text || text.trim() === '') {
      console.warn('Réponse vide du serveur');
      return [];
    }
    return JSON.parse(text);
  } catch (error) {
    console.error('Erreur API:', error);
    return [];
  }
}

// Fonction pour créer une nouvelle course
async function createCourse(courseData) {
  try {
    const response = await fetch(`${API_URL}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la création de la course');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}

// Fonction pour récupérer tous les chronos
async function getChronos() {
  try {
    // Ajouter un paramètre anti-cache pour forcer le rafraîchissement des données
    const timestamp = new Date().getTime();
    
    // Utiliser une URL sans authentification pour les chronos
    // Cela contourne les problèmes d'authentification avec l'API
    const url = `${API_URL}/chronos?_nocache=${timestamp}`;
    
    // Utiliser fetch avec des options anti-cache
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des chronos');
    }
    
    // Récupérer uniquement les vraies données de la base de données
    const text = await response.text();
    if (!text || text.trim() === '') {
      console.warn('Réponse vide du serveur pour les chronos');
      return [];
    }
    const chronos = JSON.parse(text);
    console.log(`${chronos.length} chronos récupérés de la base de données`);
    return chronos;
  } catch (error) {
    console.error('Erreur API:', error);
    // Retourner un tableau vide en cas d'erreur
    return [];
  }
}

// Fonction pour créer un nouveau chrono
async function createChrono(chronoData) {
  try {
    const response = await fetch(`${API_URL}/chronos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(chronoData),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la création du chrono');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}

// Fonctions d'authentification
async function register(userData) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'inscription');
    }
    
    // Stocker le token et les infos utilisateur
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}

async function login(credentials) {
  try {
    console.log('🔄 Tentative de login vers:', `${API_URL}/auth/login`);
    
    // Créer une promesse avec timeout pour éviter le chargement infini
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout: La connexion prend trop de temps')), 10000)
    );
    
    const fetchPromise = fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    console.log('✅ Réponse reçue, status:', response.status);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la connexion');
    }
    
    console.log('✅ Login réussi, stockage des données...');
    
    // Stocker le token et les infos utilisateur (sans double requête pour éviter blocage)
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return true;
}

function isAuthenticated() {
  return !!localStorage.getItem('token');
}

function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

async function getUserInfo() {
  try {
    const response = await fetch(`${API_URL}/auth/user`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des informations utilisateur');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    return null;
  }
}

// Fonction pour récupérer les chronos de l'utilisateur connecté
async function getMyChronos() {
  try {
    // Vérifier si l'utilisateur est connecté
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.warn('Aucun utilisateur connecté');
      return [];
    }
    
    console.log('Utilisateur actuel:', currentUser);
    
    // Récupérer tous les chronos
    const allChronos = await getChronos();
    
    // Afficher les détails de chaque chrono pour débogage
    if (allChronos && allChronos.length > 0) {
      console.log('Détails des chronos récupérés:');
      allChronos.forEach((chrono, index) => {
        console.log(`Chrono #${index + 1}:`);
        console.log('- ID:', chrono._id);
        console.log('- Utilisateur:', chrono.utilisateur);
        console.log('- Course ID:', chrono.courseId ? chrono.courseId._id : 'N/A');
        console.log('- Temps:', chrono.temps);
        console.log('- Date:', chrono.date);
        if (chrono.userId) console.log('- UserID:', chrono.userId);
        if (chrono.utilisateurId) console.log('- UtilisateurID:', chrono.utilisateurId);
        if (chrono.user_id) console.log('- User_ID:', chrono.user_id);
      });
    }
    
    console.log('Tous les chronos:', allChronos);
    
    // Filtrer par ID utilisateur si disponible, sinon par nom d'utilisateur
    let myChronos = [];
    
    // Tentative 1: Filtrage par ID utilisateur
    if (currentUser._id) {
      myChronos = allChronos.filter(chrono => {
        // Vérifier les différents formats possibles d'ID dans les chronos
        const chronoUserId = chrono.userId || chrono.utilisateurId || chrono.user_id;
        
        // Si l'ID est un objet MongoDB avec un champ $oid
        if (chronoUserId && typeof chronoUserId === 'object' && chronoUserId.$oid) {
          // Comparer avec l'ID de l'utilisateur actuel (plusieurs formats possibles)
          if (currentUser._id === chronoUserId.$oid) {
            console.log(`Correspondance par ID simple trouvée pour ${currentUser.username}`);
            return true;
          }
          
          // Si l'ID de l'utilisateur est aussi un objet avec $oid
          if (typeof currentUser._id === 'object' && currentUser._id.$oid === chronoUserId.$oid) {
            console.log(`Correspondance par ID objet trouvée pour ${currentUser.username}`);
            return true;
          }
        }
        
        // Comparaison directe des IDs (utile si les formats sont identiques)
        return chronoUserId === currentUser._id;
      });
      
      console.log(`Chronos filtrés par ID utilisateur: ${myChronos.length} pour l'ID ${currentUser._id}`);
    }
    
    // Tentative 2: Filtrage par nom d'utilisateur avec correspondances flexibles
    if (myChronos.length === 0) {
      // Préparer toutes les variantes possibles du nom d'utilisateur
      const usernameVariants = [];
      
      // Ajouter le nom d'utilisateur standard
      usernameVariants.push(currentUser.username);
      
      // Ajouter le nom complet si disponible
      if (currentUser.firstName && currentUser.lastName) {
        usernameVariants.push(`${currentUser.firstName} ${currentUser.lastName}`);
        usernameVariants.push(`${currentUser.lastName} ${currentUser.firstName}`);
        // Ajouter variantes sans espace
        usernameVariants.push(`${currentUser.firstName}${currentUser.lastName}`);
        usernameVariants.push(`${currentUser.lastName}${currentUser.firstName}`);
      }
      
      // Ajouter le nom complet (name) si disponible
      if (currentUser.name) {
        usernameVariants.push(currentUser.name);
      }
      
      // Filtrer les chronos en utilisant toutes les variantes
      myChronos = allChronos.filter(chrono => {
        // Vérifier si l'utilisateur du chrono correspond à l'une des variantes
        const match = usernameVariants.some(variant => {
          const isMatch = chrono.utilisateur === variant;
          if (isMatch) {
            console.log(`Correspondance trouvée: ${chrono.utilisateur} -> ${currentUser.username}`);
          }
          return isMatch;
        });
        
        return match;
      });
      
      console.log(`Chronos filtrés par nom d'utilisateur: ${myChronos.length} pour ${currentUser.username}`);
    }
    
    // Afficher les chronos trouvés pour débogage
    if (myChronos.length > 0) {
      console.log('Chronos personnels trouvés:', myChronos);
    } else {
      console.warn('Aucun chrono personnel trouvé pour cet utilisateur');
    }
    
    return myChronos;
  } catch (error) {
    console.error('Erreur lors de la récupération des chronos personnels:', error);
    return [];
  }
}

// Fonctions d'administration - Utilise les routes sécurisées avec authentification
async function getAllUsers() {
  try {
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: getAuthHeaders(),
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return [];
  }
}

// Recharger les utilisateurs via la route debug (admin authentifié)
async function forceReloadUsers() {
  try {
    const response = await fetch(`${API_URL}/admin/debug`, {
      headers: getAuthHeaders(),
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Erreur lors du rechargement des utilisateurs:', error);
    return [];
  }
}

async function deleteUser(userId) {
  try {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de l\'utilisateur');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}

async function promoteUser(userId) {
  try {
    const response = await fetch(`${API_URL}/admin/users/${userId}/promote`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la promotion de l\'utilisateur');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}

async function demoteUser(userId) {
  try {
    const response = await fetch(`${API_URL}/admin/users/${userId}/demote`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la rétrogradation de l\'administrateur');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}

async function getAdminStats() {
  try {
    const response = await fetch(`${API_URL}/admin/stats`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    return null;
  }
}

// Exporter les fonctions API
window.API = {
  getCourses,
  createCourse,
  getChronos,
  createChrono,
  register,
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  getUserInfo,
  getMyChronos,
  // Fonctions d'administration
  getAllUsers,
  forceReloadUsers, // Ajout de la nouvelle fonction
  deleteUser,
  promoteUser,
  demoteUser,
  getAdminStats
};
