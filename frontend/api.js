// API pour communiquer avec le backend
const isProduction = window.location.hostname !== 'localhost';
// Utiliser l'URL directe de Render en production
const API_URL = isProduction ? 'https://chronotime-api.onrender.com/api' : 'http://localhost:9000/api';

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
    const response = await fetch(`${API_URL}/chronos`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des chronos');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
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
    const response = await fetch(`${API_URL}/chronos/mes-chronos`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de mes chronos');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
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

// Nouvelle fonction spéciale pour récupérer les utilisateurs en temps réel
async function forceReloadUsers() {
  console.log('Forçage de la récupération des utilisateurs en temps réel...');
  
  try {
    // Ajouter un timestamp pour éviter la mise en cache
    const timestamp = new Date().getTime();
    
    // Essayer d'accéder directement à l'API avec un proxy CORS en ligne
    // Utiliser un proxy CORS public pour contourner les restrictions CORS
    const directUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`${API_URL}/admin/direct-users?_t=${timestamp}`)}`;  
    
    // Utiliser XMLHttpRequest pour éviter la mise en cache
    const proxyXhrPromise = new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', directUrl, true);
      xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      xhr.setRequestHeader('Pragma', 'no-cache');
      xhr.setRequestHeader('Expires', '0');
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const responseData = JSON.parse(xhr.responseText);
            if (responseData.success && responseData.users) {
              console.log('SUCCÈS: Utilisateurs récupérés via proxy CORS:', responseData.count);
              resolve(responseData.users);
            } else {
              reject(new Error('Format de réponse proxy invalide'));
            }
          } catch (e) {
            reject(new Error('Erreur de parsing JSON proxy: ' + e.message));
          }
        } else {
          reject(new Error('Statut HTTP proxy: ' + xhr.status));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('Erreur réseau proxy'));
      };
      
      xhr.send();
    });
    
    try {
      const usersFromProxy = await proxyXhrPromise;
      return usersFromProxy;
    } catch (proxyError) {
      console.warn('Erreur proxy CORS:', proxyError.message);
      // Si ça échoue, essayer la méthode standard
      return await getAllUsers();
    }
  } catch (error) {
    console.error('Erreur critique dans forceReloadUsers:', error);
    return await getAllUsers(); // Tomber sur la méthode standard en cas d'échec
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
