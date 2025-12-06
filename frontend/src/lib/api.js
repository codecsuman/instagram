import axios from "axios";

// ✅ PROD + DEV BASE URL AUTO DETECT
const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

// ✅ Axios instance
const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true, // ✅ Send httpOnly cookies (REQUIRED)
  timeout: 15000,
});

// --------------------------------------------
// ✅ REQUEST INTERCEPTOR (JWT FALLBACK SUPPORT)
// --------------------------------------------
api.interceptors.request.use(
  (config) => {
    try {
      const persisted = localStorage.getItem("persist:root");

      if (persisted) {
        const parsed = JSON.parse(persisted);
        const auth = parsed?.auth ? JSON.parse(parsed.auth) : null;

        // ✅ Support header-based auth fallback
        if (auth?.token) {
          config.headers.Authorization = `Bearer ${auth.token}`;
        }
      }
    } catch (err) {
      console.warn("⚠️ Invalid Redux Persist Data");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --------------------------------------------
// ✅ RESPONSE INTERCEPTOR (SESSION EXPIRED FIX)
// --------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // ✅ ONLY logout when session truly expired
    if (status === 401 || status === 403) {
      localStorage.removeItem("persist:root");
      localStorage.removeItem("token");

      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
