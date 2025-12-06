import axios from "axios";

// ✅ BASE URL (Render backend)
const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

// ✅ Axios instance
const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,   // ✅ SEND COOKIE
  timeout: 15000,
});

// --------------------------------------------
// ✅ REQUEST INTERCEPTOR (COOKIE ONLY ✅)
// --------------------------------------------
api.interceptors.request.use(
  (config) => {
    // ❌ DO NOT SET Authorization HEADER
    // ✅ Cookie is sent automatically
    return config;
  },
  (error) => Promise.reject(error)
);

// --------------------------------------------
// ✅ RESPONSE INTERCEPTOR (HANDLE EXPIRED SESSION)
// --------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.clear();

      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
