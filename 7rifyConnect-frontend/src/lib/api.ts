import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api";
const useSanctum = import.meta.env.VITE_USE_SANCTUM === "true";

export const api = axios.create({
  baseURL,
  withCredentials: useSanctum,
  headers: {
    Accept: "application/json",
  },
});

let csrfPromise: Promise<unknown> | null = null;

export async function ensureCsrf(force = false) {
  if (!useSanctum) return;
  if (!csrfPromise || force) {
    csrfPromise = api
      .get("/sanctum/csrf-cookie", { withCredentials: true })
      .catch((error) => {
        csrfPromise = null;
        throw error;
      });
  }
  return csrfPromise;
}

api.interceptors.request.use(async (config) => {
  const method = config?.method?.toLowerCase();
  if (useSanctum && method && ["post", "put", "patch", "delete"].includes(method)) {
    await ensureCsrf();
  }

  const token =
    typeof window !== "undefined" && (window as any)?.__APP_TOKEN__
      ? (window as any).__APP_TOKEN__
      : undefined;

  if (token) {
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
    const code = error?.response?.data?.code;
    if (code === "ARTISAN_NOT_APPROVED" && typeof window !== "undefined") {
      const redirectTo = "/pending-approval";
      if (window.location.pathname !== redirectTo) {
        window.location.href = redirectTo;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
