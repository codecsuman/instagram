import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
  timeout: 10000,
});

// Add token automatically
api.interceptors.request.use((config) => {
  const persisted = localStorage.getItem("persist:root");

  if (persisted) {
    const parsed = JSON.parse(persisted);
    const auth = parsed.auth ? JSON.parse(parsed.auth) : null;

    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
  }

  return config;
});

// Auto redirect on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // clear redux persist properly
      localStorage.removeItem("persist:root");
      localStorage.removeItem("token");

      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
