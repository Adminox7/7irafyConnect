import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ⚠️ هذا الملف خاص بالـ frontend (React) اللي فيه src/, index.html, package.json ...

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy نحو الـ Laravel API
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000", // Laravel backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
