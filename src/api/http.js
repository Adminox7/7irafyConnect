import axios from "axios";

// Read baseURL from env; default to '/api/v1'
const baseURL = import.meta?.env?.VITE_API_URL || "/api/v1";

export const http = axios.create({
  baseURL,
});
