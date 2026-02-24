import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const API_PREFIX = import.meta.env.VITE_API_PREFIX || "/api";
const API_BASE = API_BASE_URL ? `${API_BASE_URL}${API_PREFIX}` : API_PREFIX;

const AUTH_TOKEN_KEY = "fincore_token";

export function getAuthToken() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token) {
    if (typeof window === "undefined") return;
    if (!token) return;
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" }
});

function isPublicEndpoint(url = "") {
    return url.includes("/auth/");
}

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token && !isPublicEndpoint(config.url)) {
    config.headers = config.headers || {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      clearAuthToken();
      window.localStorage.removeItem("fincore_role");
      window.localStorage.removeItem("fincore_account");
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE, API_BASE_URL, API_PREFIX };
