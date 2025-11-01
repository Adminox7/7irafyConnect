// src/api/http.js
import toast from "react-hot-toast";
import { api, ensureCsrf } from "../lib/api";
import { useAuthStore } from "../stores/auth";

/* ------------------ Toast once ------------------ */
export const showErrorOnce = (message, id) => {
  try {
    const key = id || `err:${String(message || "").slice(0, 80)}`;
    if (!toast.isActive(key)) toast.error(message, { id: key });
  } catch {}
};

/* ------------------ Axios instance ------------------ */
export const http = api;
export { ensureCsrf };

/* ------------ انتظر rehydrate ديال Zustand (≤1s) ------------ */
const waitForHydration = async () => {
  const start = Date.now();
  while (!useAuthStore.getState()?.hydrated) {
    if (Date.now() - start > 1000) break; // safety timeout
    await new Promise((r) => setTimeout(r, 30));
  }
};

/* ------------------ Request interceptor ------------------ */
http.interceptors.request.use(
  async (config) => {
    await waitForHydration();
    const { token } = useAuthStore.getState() || {};
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers = { ...(config.headers || {}), Accept: "application/json" };
    return config;
  },
  (e) => Promise.reject(e)
);

/* ------------------ Response interceptor ------------------ */
http.interceptors.response.use(
  (r) => r,
  (error) => {
    const res = error?.response;
    const status = res?.status;

    let message =
      res?.data?.message ||
      res?.data?.error ||
      res?.statusText ||
      (status === 0 ? "تعذّر الاتصال بالخادم" : "حدث خطأ غير متوقع");

    // Laravel validation
    if (!res?.data?.message && res?.data?.errors) {
      const firstKey = Object.keys(res.data.errors)[0];
      const firstMsg = res.data.errors[firstKey]?.[0];
      if (firstMsg) message = firstMsg;
    }

    if (!error?.config?.suppressToast) {
      if (!status || status >= 500 || status === 0 || (status >= 400 && status !== 401)) {
        showErrorOnce(message);
      }
    }

    return Promise.reject({
      status,
      message,
      data: res?.data,
      original: error,
    });
  }
);
