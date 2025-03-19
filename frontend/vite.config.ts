import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    react(),

    // Gzip compression for assets (JS, JSON, CSS, etc.)
    viteCompression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 1024, // Only compress files >1kb
      filter: /\.(js|mjs|json|css|html|svg|webp)$/i, // Compress .json too!
    }),

    // Brotli compression
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 1024,
      filter: /\.(js|mjs|json|css|html|svg|webp)$/i,
    }),
  ],

  base: "/", // Keep absolute path
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
