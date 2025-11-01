/* eslint-env node */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ⚠️ هذا الملف خاص بالـ frontend (React) اللي فيه src/, index.html, package.json ...

const backendTarget = process.env.VITE_API_PROXY || "http://127.0.0.1:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy نحو الـ Laravel API
    proxy: {
      "/api": {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
      "/sanctum": {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
      "/login": {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
      "/logout": {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
      "/user": {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
