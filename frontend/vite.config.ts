import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteCompression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
    plugins: [
        react(),
        viteCompression({ algorithm: "gzip", ext: ".gz", threshold: 1024, filter: /\.(js|mjs|json|css|html|svg|webp)$/i, }),
        viteCompression({ algorithm: "brotliCompress", ext: ".br", threshold: 1024, filter: /\.(js|mjs|json|css|html|svg|webp)$/i, }),
        visualizer({ filename: "stats.html", gzipSize: true, brotliSize: true, open: false, }),
    ],
    base: "/",
    publicDir: "public",
    build: {
        outDir: "build",
        rollupOptions: {
            input: "index.html",
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        return "vendor"; // All node_modules in vendor chunk
                    }

                    if (id.includes("react-google-recaptcha")) {
                        return "recaptcha";
                    }

                    if(id.includes("emailjs-com")){
                        return "emailjs";
                    }

                    if(id.includes("react") || id.includes("react-dom")){
                        return "react";
                    }

                    // Add more chunking logic here if needed (e.g., for routes or large components)
                },
                chunkFileNames: "assets/[name].[hash].js",
                entryFileNames: "assets/[name].[hash].js",
                assetFileNames: "assets/[name].[hash][extname]",
            },
        },
        chunkSizeWarningLimit: 1000,
    },
    server: { port: 3000, },
    preview: { port: 4173, },
});