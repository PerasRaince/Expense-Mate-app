import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "College Expense Tracker",
        short_name: "ExpenseTracker",
        start_url: "/",
        display: "standalone",
        background_color: "#0f172a",
        theme_color: "#0f172a",
        icons: [
          {
            src: "/icons/vite.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          }
        ]
      }
    })
  ]
});
