import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api/itunes": {
        target: "https://itunes.apple.com",
        changeOrigin: true,
        rewrite: (path) => path.includes("artistId=")
          ? path.replace(/^\/api\/itunes\?artistId=/, "/lookup?id=")
          : path.replace(/^\/api\/itunes/, "/search"),
      },
      "/api": "http://localhost:5000",
    },
  },
});
