import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",  // Use absolute path to avoid module loading issues
  publicDir: "public",
  build: {
    outDir: "build",
    rollupOptions: {
      input: "index.html",
    },
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 4173,
  },
});
