import axios from "axios";
import { useAuthStore } from "../stores/auth";

// Keep axios baseURL fixed for dev/MSW; switch via README when needed
export const http = axios.create({
  baseURL: "/api/v1",
});

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
