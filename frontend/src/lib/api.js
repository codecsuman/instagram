import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true // ✅ Important for cookies on Render
});

/* ====================== REQUEST INTERCEPTOR ====================== */
api.interceptors.request.use((config) => {

  // ✅ Inject Bearer token fallback
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ✅ Let browser handle FormData boundaries properly
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;

}, (error) => Promise.reject(error));


/* ====================== RESPONSE INTERCEPTOR ====================== */
api.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.code === "ERR_CANCELED") return Promise.reject(error);

    console.error("❌ API ERROR:", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message
    });

    return Promise.reject(error);
  }
);

export default api;
