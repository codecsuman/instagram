import axios from "axios";

// Base URL from environment (Render backend URL for prod, localhost for dev)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Axios instance
const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
  timeout: 10000,
});

// --------------------------------------------
// REQUEST INTERCEPTOR (ADD TOKEN SAFELY)
// --------------------------------------------
api.interceptors.request.use((config) => {
  try {
    const persisted = localStorage.getItem("persist:root");
    if (!persisted) return config;

    const parsed = JSON.parse(persisted);
    const auth = parsed.auth ? JSON.parse(parsed.auth) : null;

    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
  } catch (error) {
    console.warn("⚠️ Invalid redux persist data");
  }

  return config;
});

// --------------------------------------------
// RESPONSE INTERCEPTOR (AUTO LOGOUT ON 401)
// --------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("persist:root");
      localStorage.removeItem("token");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
