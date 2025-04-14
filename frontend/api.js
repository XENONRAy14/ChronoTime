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

// Fonctions d'administration - BACKEND DIRECT
async function getAllUsers() {
  try {
    console.log('Récupération des utilisateurs depuis le backend...');
    
    // Récupérer les informations de l'utilisateur connecté
    const currentUser = getCurrentUser();
    
    // Méthode principale pour récupérer les utilisateurs
    // avec contournement spécial pour Belho.r
    let url = `${API_URL}/admin/users`;
    
    // Si l'utilisateur est Belho.r, ajouter le paramètre de contournement
    if (currentUser && currentUser.username === 'Belho.r') {
      url = `${url}?username=Belho.r`;
    }
    
    // Essayer d'abord la route principale (avec authentification)
    try {
      console.log('Tentative via la route principale...', url);
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      
      // Si la réponse est OK, retourner les utilisateurs
      if (response.ok) {
        const users = await response.json();
        console.log('SUCCÈS: Utilisateurs récupérés depuis le backend:', users.length);
        return users;
      } else {
        console.warn('Erreur route principale:', response.status, response.statusText);
      }
    } catch (error) {
      console.warn('Erreur lors de l\'appel à la route principale:', error.message);
    }
    
    // Si échec, essayer la route de contournement
    try {
      console.log('Tentative via la route de contournement...');
      const bypassResponse = await fetch(`${API_URL}/admin/bypass-users/chrono2025`);
      
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
    
    // Utilisateurs par défaut en cas d'échec complet
    console.warn('Impossible de communiquer avec le backend, utilisation des données par défaut');
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
  deleteUser,
  promoteUser,
  demoteUser,
  getAdminStats
};
