import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const TOKEN_KEY = 'crm_token';
const TOKEN_EXPIRY_KEY = 'crm_token_expiry';
const USER_KEY = 'crm_user';

// Roughly matches backend JWT_EXPIRES_IN default of 2h.
// This is a client-side convenience check only - the backend independently
// verifies and rejects expired tokens regardless of what the client believes.
const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

export const authStorage = {
  setSession(token, user) {
    const expiry = Date.now() + TOKEN_TTL_MS;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiry));
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getToken() {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = Number(localStorage.getItem(TOKEN_EXPIRY_KEY) || 0);
    if (!token || !expiry || Date.now() > expiry) {
      return null;
    }
    return token;
  },
  getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// Attach JWT to every outgoing request if present and not expired
api.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized handling of expired/invalid sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      authStorage.clearSession();
      // Avoid redirect loop if already on login/register page
      const publicPaths = ['/login', '/register'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth endpoints ---
export const registerUser = (payload) => api.post('/auth/register', payload);
export const loginUser = (payload) => api.post('/auth/login', payload);
export const fetchMe = () => api.get('/auth/me');

// --- Opportunity endpoints ---
export const fetchOpportunities = (params) => api.get('/opportunities', { params });
export const fetchOpportunityById = (id) => api.get(`/opportunities/${id}`);
export const createOpportunity = (payload) => api.post('/opportunities', payload);
export const updateOpportunity = (id, payload) => api.put(`/opportunities/${id}`, payload);
export const deleteOpportunity = (id) => api.delete(`/opportunities/${id}`);

export default api;
