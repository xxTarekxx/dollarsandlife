import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",  // Ensures relative paths
  publicDir: "public",  // Keeps static assets in public
  build: {
    outDir: "build",  // Ensures the build goes into 'build' folder
    rollupOptions: {
      input: "index.html",  // Explicitly set entry file
    },
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 4173,
  },
});
