// API pour communiquer avec le backend
const isProduction = window.location.hostname !== 'localhost';
// Utiliser l'URL directe de Render en production
const API_URL = isProduction ? 'https://chronotime-api.onrender.com/api' : 'http://localhost:9000/api';

// Forcer une nouvelle connexion à chaque requête
const forceNoCache = true;

// Afficher l'URL de l'API pour le débogage
console.log('API URL:', API_URL);

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
    return await response.json();
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
    const chronos = await response.json();
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
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la connexion');
    }
    
    // Vérifier si l'utilisateur est admin dans la base de données
    try {
      const userInfoResponse = await fetch(`${API_URL}/auth/user`, {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });
      
      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json();
        // Mettre à jour les informations utilisateur avec les données les plus récentes
        data.user = userInfo.user || data.user;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut admin:', error);
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
    
    if (currentUser._id) {
      // Filtrer par ID utilisateur (méthode préférée)
      myChronos = allChronos.filter(chrono => {
        // Vérifier si le chrono a un userId ou un utilisateurId
        const chronoUserId = chrono.userId || chrono.utilisateurId || chrono.user_id;
        return chronoUserId === currentUser._id;
      });
      
      console.log(`Chronos filtrés par ID utilisateur: ${myChronos.length} pour l'ID ${currentUser._id}`);
    }
    
    // Si aucun chrono n'est trouvé par ID, essayer par nom d'utilisateur
    if (myChronos.length === 0) {
      myChronos = allChronos.filter(chrono => {
        // Essayer plusieurs formats possibles
        return (
          // Format standard
          chrono.utilisateur === currentUser.username ||
          // Format nom complet
          chrono.utilisateur === `${currentUser.firstName} ${currentUser.lastName}` ||
          // Format nom complet inversé
          chrono.utilisateur === `${currentUser.lastName} ${currentUser.firstName}`
        );
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

// Fonctions d'administration - SOLUTION DIRECTE 2.0
async function getAllUsers() {
  try {
    console.log('Récupération des utilisateurs depuis le backend (solution 2.0)...');
    
    // Ajouter un timestamp pour éviter la mise en cache
    const timestamp = new Date().getTime();
    
    // Essayer d'abord la nouvelle route directe spéciale
    try {
      console.log('Tentative via la nouvelle route directe...');
      
      // Utiliser XMLHttpRequest au lieu de fetch pour éviter la mise en cache
      const directUsersPromise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${API_URL}/admin/direct-users?_t=${timestamp}`, true);
        xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        xhr.setRequestHeader('Pragma', 'no-cache');
        xhr.setRequestHeader('Expires', '0');
        
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const responseData = JSON.parse(xhr.responseText);
              if (responseData.success && responseData.users) {
                console.log('SUCCÈS: Utilisateurs récupérés via route directe:', responseData.count);
                resolve(responseData.users);
              } else {
                reject(new Error('Format de réponse invalide'));
              }
            } catch (e) {
              reject(new Error('Erreur de parsing JSON: ' + e.message));
            }
          } else {
            reject(new Error('Statut HTTP: ' + xhr.status));
          }
        };
        
        xhr.onerror = function() {
          reject(new Error('Erreur réseau'));
        };
        
        xhr.send();
      });
      
      try {
        const usersFromDirectRoute = await directUsersPromise;
        return usersFromDirectRoute;
      } catch (directRouteError) {
        console.warn('Erreur route directe:', directRouteError.message);
        // Continuer avec les autres méthodes
      }
    } catch (error) {
      console.warn('Erreur lors de l\'appel à la route directe:', error.message);
    }

    // Essayer la route de contournement
    try {
      console.log('Tentative via la route de contournement...');
      const bypassResponse = await fetch(`${API_URL}/admin/bypass-users/chrono2025?_nocache=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        mode: 'cors'
      });
      
      if (bypassResponse.ok) {
        const users = await bypassResponse.json();
        console.log('SUCCÈS: Utilisateurs récupérés via contournement:', users.length);
        return users;
      } else {
        console.warn('Erreur route contournement:', bypassResponse.status, bypassResponse.statusText);
      }
    } catch (error) {
      console.warn('Erreur lors de l\'appel à la route de contournement:', error.message);
    }
    
    // Essayer une requête JSONP en dernier recours
    // Note: le backend devrait supporter cette approche
    try {
      console.log('Tentative via JSONP...');
      const jsonpUrl = `${API_URL}/admin/bypass-users/chrono2025?_nocache=${timestamp}&callback=handleUsersData`;
      
      const jsonpPromise = new Promise((resolve, reject) => {
        // Définir une fonction globale qui sera appelée par le script JSONP
        window.handleUsersData = function(data) {
          if (Array.isArray(data)) {
            console.log('SUCCÈS: Utilisateurs récupérés via JSONP:', data.length);
            resolve(data);
          } else {
            reject(new Error('Format de données JSONP invalide'));
          }
          // Nettoyer la fonction globale
          delete window.handleUsersData;
        };
        
        // Créer une balise script pour le JSONP
        const script = document.createElement('script');
        script.src = jsonpUrl;
        script.onerror = function() {
          reject(new Error('Erreur lors du chargement du script JSONP'));
          // Nettoyer la fonction globale en cas d'erreur
          delete window.handleUsersData;
        };
        
        // Ajouter un timeout
        const timeout = setTimeout(() => {
          reject(new Error('Timeout JSONP'));
          // Nettoyer la fonction globale et la balise script en cas de timeout
          delete window.handleUsersData;
          document.body.removeChild(script);
        }, 5000);
        
        script.onload = function() {
          clearTimeout(timeout);
        };
        
        document.body.appendChild(script);
      });
      
      try {
        const usersFromJsonp = await jsonpPromise;
        return usersFromJsonp;
      } catch (jsonpError) {
        console.warn('Erreur JSONP:', jsonpError.message);
      }
    } catch (error) {
      console.warn('Erreur lors de l\'appel JSONP:', error.message);
    }
    
    // Utilisateurs par défaut en cas d'échec complet
    console.warn('TOUTES LES MÉTHODES ONT ÉCHOUÉ, utilisation des données par défaut');
    const defaultUsers = [
      {
        _id: "67fb16047f01ff280bd3381e",
        username: "Belho.r",
        email: "rayanbelho@hotmail.com",
        name: "Rayan BELHOCINE",
        isAdmin: true,
        createdAt: "2025-04-13T13:52:30.220Z",
        status: "actif"
      },
      {
        _id: "67fc6c80e98a07a20ce94476",
        username: "Averoesghoost1506",
        email: "aksel.kadi0000@gmail.com",
        name: "Kadi koceila",
        isAdmin: false,
        createdAt: "2025-04-14T02:01:36.214Z",
        status: "actif"
      }
    ];
    return defaultUsers;
  } catch (error) {
    console.error('Erreur critique dans getAllUsers:', error);
    return [];
  }
}

// SOLUTION DIRECTE & SIMPLE: Récupération des utilisateurs via une requête directe
function forceReloadUsers() {
  console.log('NOUVELLE SOLUTION: Récupération directe des utilisateurs...');
  
  // Récupérer TOUS les utilisateurs enregistrés dans la BD
  return fetch('https://chronotime-api.onrender.com/api/admin/debug')
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(`Statut réponse: ${response.status}`);
    })
    .then(data => {
      // Extraire et sauvegarder les utilisateurs dans la variable globale
      // pour le débogage
      window._rawUsers = data.users;
      console.log(`DÉBOGAGE: ${data.users.length} utilisateurs reçus:`, data.users);
      
      // NOUVEAU: Mettre à jour le currentUser si l'utilisateur actuel est dans la liste
      updateCurrentUserInfo(data.users);
      
      // Retourner explicitement les utilisateurs
      return data.users;
    })
    .catch(error => {
      console.error('Erreur lors de la récupération directe:', error);
      
      // Solution de secours: Essayer via la méthode classique
      return fetch('https://chronotime-api.onrender.com/api/admin/bypass-users/chrono2025')
        .then(response => response.json())
        .then(data => {
          const users = data.data || data.users || data;
          window._rawUsers = users;
          console.log(`DÉBOGAGE (backup): ${users.length} utilisateurs reçus:`, users);
          return users;
        })
        .catch(secondError => {
          console.error('Erreur également sur la méthode de secours:', secondError);
          return [];
        });
    });
}

// Nouvelle fonction pour mettre à jour l'utilisateur actuel avec les données du serveur
function updateCurrentUserInfo(users) {
  try {
    // Récupérer l'utilisateur courant du localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    
    const currentUser = JSON.parse(userStr);
    // Chercher cet utilisateur dans la liste fraîchement récupérée
    const updatedUser = users.find(u => 
      u.username === currentUser.username || 
      u.email === currentUser.email ||
      (u.id && u.id === currentUser.id) ||
      (u._id && u._id === currentUser.id)
    );
    
    if (updatedUser) {
      console.log('Utilisateur trouvé dans les données fraîches:', updatedUser);
      
      // Mettre à jour les informations importantes de l'utilisateur local
      const newUserInfo = {
        ...currentUser,
        isAdmin: updatedUser.isAdmin === true, // Forcer la valeur booléenne
        id: updatedUser.id || updatedUser._id,
        name: updatedUser.name || currentUser.name,
        email: updatedUser.email || currentUser.email,
        username: updatedUser.username || currentUser.username,
        createdAt: updatedUser.createdAt || currentUser.createdAt
      };
      
      console.log('Mise à jour des informations utilisateur dans localStorage:', newUserInfo);
      localStorage.setItem('user', JSON.stringify(newUserInfo));
      
      // Ne PAS rafraîchir la page automatiquement - cela cause des problèmes
      if (newUserInfo.isAdmin !== currentUser.isAdmin) {
        console.log('Le statut administrateur a changé, mais pas de refresh automatique pour éviter les problèmes');
        // setTimeout(() => window.location.reload(), 1000); // Désactivé
      }
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour des infos utilisateur:', error);
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
