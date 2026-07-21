// frontend/src/lib/api.js
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.trim() || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  withCredentials: true, // required for cookie-based auth
  timeout: 15000,
});

// -----------------------------
// RESPONSE INTERCEPTOR
// -----------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // IGNORE CANCELLED REQUESTS (from AbortController cleanup)
    if (
      error.code === "ERR_CANCELED" ||
      error.code === "ECONNABORTED" ||
      error.message === "canceled" ||
      error.message === "Request aborted"
    ) {
      // Silently reject without logging — this is expected behavior
      return Promise.reject(error);
    }

    // network / backend down / CORS / timeout
    if (!error.response) {
      console.error("❌ API Network Error:", error.message);
      return Promise.reject({
        ...error,
        message:
          "Unable to connect to the server. Please check backend deployment or your internet connection.",
      });
    }

    // auth failure
    if (error.response.status === 401) {
      console.warn("⚠️ Unauthorized request");
    }

    return Promise.reject(error);
  },
);

export default api;
