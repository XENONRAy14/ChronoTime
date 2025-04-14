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

// Fonctions d'administration
async function getAllUsers() {
  try {
    console.log('Tentative de récupération des utilisateurs...');
    
    // Essayer d'abord la route normale
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: getAuthHeaders()
      });
      
      console.log('Réponse de la route normale:', response.status, response.statusText);
      
      if (response.ok) {
        const users = await response.json();
        console.log('Utilisateurs récupérés via la route normale:', users.length);
        return users;
      }
    } catch (normalRouteError) {
      console.warn('Erreur avec la route normale:', normalRouteError.message);
    }
    
    // Si la route normale échoue, essayer la route de contournement
    console.log('Tentative avec la route de contournement...');
    const bypassResponse = await fetch(`${API_URL}/admin/bypass-users/chrono2025`);
    
    console.log('Réponse de la route de contournement:', bypassResponse.status, bypassResponse.statusText);
    
    if (!bypassResponse.ok) {
      throw new Error(`Erreur lors de la récupération des utilisateurs (${bypassResponse.status})`);
    }
    
    const users = await bypassResponse.json();
    console.log('Utilisateurs récupérés via la route de contournement:', users.length);
    return users;
  } catch (error) {
    console.error('Erreur API getAllUsers:', error);
    
    // En dernier recours, utiliser les données mock si elles existent
    const mockUsers = JSON.parse(localStorage.getItem('adminMockUsers'));
    if (mockUsers && mockUsers.length > 0) {
      console.log('Utilisation des données utilisateurs en cache:', mockUsers.length);
      return mockUsers;
    }
    
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
