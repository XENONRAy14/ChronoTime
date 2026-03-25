/* ChronoTime API Module */

const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const API_URL = isProduction
  ? 'https://chronotime-api.onrender.com/api'
  : `${window.location.protocol}//${window.location.hostname}:9000/api`;

function getToken() { return localStorage.getItem('token'); }

function getAuthHeaders() {
  const token = getToken();
  return { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };
}

async function safeFetch(url, opts = {}) {
  const res = await fetch(url, { ...opts, headers: { ...getAuthHeaders(), ...(opts.headers || {}) } });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Erreur ${res.status}`);
  }
  const text = await res.text();
  if (!text || !text.trim()) return null;
  return JSON.parse(text);
}

// ─── Courses ────────────────────────────────────────────────
async function getCourses() {
  try { return await safeFetch(`${API_URL}/courses`) || []; }
  catch { return []; }
}

async function createCourse(data) {
  return safeFetch(`${API_URL}/courses`, { method: 'POST', body: JSON.stringify(data) });
}

// ─── Chronos ────────────────────────────────────────────────
async function getChronos() {
  try { return await safeFetch(`${API_URL}/chronos`) || []; }
  catch { return []; }
}

async function createChrono(data) {
  return safeFetch(`${API_URL}/chronos`, { method: 'POST', body: JSON.stringify(data) });
}

// ─── Auth ───────────────────────────────────────────────────
async function register(userData) {
  const data = await safeFetch(`${API_URL}/auth/register`, { method: 'POST', body: JSON.stringify(userData) });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

async function login(credentials) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      signal: controller.signal
    });
    clearTimeout(timeout);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Identifiants incorrects');
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (e) {
    clearTimeout(timeout);
    if (e.name === 'AbortError') throw new Error('Connexion trop lente, réessayez.');
    throw e;
  }
}

function logout() { localStorage.removeItem('token'); localStorage.removeItem('user'); }
function isAuthenticated() { return !!getToken(); }
function getCurrentUser() { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } }

// ─── Admin ──────────────────────────────────────────────────
async function getAllUsers() {
  try { return await safeFetch(`${API_URL}/admin/users`) || []; }
  catch { return []; }
}

async function deleteUser(id) {
  return safeFetch(`${API_URL}/admin/users/${id}`, { method: 'DELETE' });
}

async function promoteUser(id) {
  return safeFetch(`${API_URL}/admin/users/${id}/promote`, { method: 'PATCH' });
}

async function demoteUser(id) {
  return safeFetch(`${API_URL}/admin/users/${id}/demote`, { method: 'PATCH' });
}

async function getAdminStats() {
  try { return await safeFetch(`${API_URL}/admin/stats`); }
  catch { return null; }
}

// ─── Export ─────────────────────────────────────────────────
window.API = {
  API_URL,
  getCourses, createCourse,
  getChronos, createChrono,
  register, login, logout,
  isAuthenticated, getCurrentUser,
  getAllUsers, deleteUser, promoteUser, demoteUser, getAdminStats
};
