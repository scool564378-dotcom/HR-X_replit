import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api/hh": {
        target: "https://api.hh.ru",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/hh/, ""),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.removeHeader("user-agent");
            proxyReq.setHeader("User-Agent", "Mozilla/5.0 (compatible; HRXBot/1.0)");
          });
        },
      },
      "/api/trudvsem": {
        target: "http://opendata.trudvsem.ru/api/v1",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/trudvsem/, ""),
      },
      "/api/auth": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/api/presets": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/api/results": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/api/admin": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/api/promo": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/api/health": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
