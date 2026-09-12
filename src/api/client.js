import axios from "axios";

// In dev, Vite proxies /api to localhost:4000 (see vite.config.js).
// In production, set VITE_API_BASE_URL to your deployed backend's URL,
// e.g. https://loop-api.onrender.com/api
const baseURL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

const api = axios.create({ baseURL });

// Registered by authStore at startup, so this file doesn't need to import
// the store directly (avoids a circular import — the store also uses `api`).
let getToken = () => null;
let onUnauthorized = () => {};

export const registerAuthHooks = (getTokenFn, onUnauthorizedFn) => {
  getToken = getTokenFn;
  onUnauthorized = onUnauthorizedFn;
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      onUnauthorized();
    }
    return Promise.reject(err);
  }
);

export default api;
