import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:8000", changeOrigin: true },
      "/uploads": { target: "http://localhost:8000", changeOrigin: true },
    },
  },
  define: {
    // In production the Mini App is served from the same origin as the API (via Nginx),
    // so VITE_API_URL should be empty — all requests go to relative paths.
    "import.meta.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL ?? ""),
  },
});
