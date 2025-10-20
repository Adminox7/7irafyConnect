import axios from "axios";
import { useAuthStore } from "../stores/auth";
import toast from "react-hot-toast";

// Keep axios baseURL fixed for dev/MSW; switch via README when needed
export const http = axios.create({
  baseURL: "/api/v1",
   withCredentials: false,
});

// Show a single error toast per message id to avoid spam
export function showErrorOnce(message, id) {
  try {
    const key = id || `err:${String(message || "").slice(0, 80)}`;
    if (!toast.isActive(key)) {
      toast.error(message, { id: key });
    }
  } catch {}
}

// Attach Authorization header from auth store
http.interceptors.request.use((config) => {
  try {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

// Normalize error responses and show friendly message (de-duplicated)
http.interceptors.response.use(
  (r) => r,
  (error) => {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      (status === 0 ? "تعذر الاتصال بالخادم" : "حدث خطأ غير متوقع");
    // Non-spammy toast: only for network or 5xx/4xx (excluding 401 on auth pages)
    if (!error?.config?.suppressToast) {
      if (!status || status >= 500 || status === 0) {
        showErrorOnce(message);
      } else if (status >= 400 && status !== 401) {
        showErrorOnce(message);
      }
    }
    // Reject with a normalized error object
    return Promise.reject({
      status,
      message,
      data: error?.response?.data,
      original: error,
    });
  }
);
