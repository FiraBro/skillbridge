import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const apiProxy = {
  "/api": {
    target: process.env.VITE_API_PROXY_TARGET || "http://localhost:4000",
    changeOrigin: true,
  },
  "/uploads": {
    target: process.env.VITE_API_PROXY_TARGET || "http://localhost:4000",
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: apiProxy,
  },
  preview: {
    proxy: apiProxy,
  },
});
