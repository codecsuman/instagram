import axios from "axios";

// Base backend URL (Render)
const API_URL = import.meta.env.VITE_API_URL || "https://instagram-1-77f5.onrender.com";

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,   // ✅ IMPORTANT for cookies
  timeout: 10000,
});

// ----------------------------------------------------
// REQUEST INTERCEPTOR
// ----------------------------------------------------
api.interceptors.request.use(
  (config) => {
    return config;   // ✅ no token needed (cookie-based auth)
  },
  (error) => Promise.reject(error)
);

// ----------------------------------------------------
// RESPONSE INTERCEPTOR → AUTO LOGOUT ON 401
// ----------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Clear persisted redux state
      localStorage.removeItem("persist:root");

      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
