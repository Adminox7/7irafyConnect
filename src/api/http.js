import axios from "axios";
import { useAuthStore } from "../stores/auth";

// Read baseURL from env; default to '/api/v1'
const baseURL = import.meta?.env?.VITE_API_URL || "/api/v1";

export const http = axios.create({
  baseURL,
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
