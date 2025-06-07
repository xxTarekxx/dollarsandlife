// frontend/vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';
import fs from 'fs'; // For diagnostic check

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // --- Start Diagnostic Logging ---
  const srcAliasPath = path.resolve(__dirname, './src');
  const assetsAliasPath = path.resolve(__dirname, './src/assets');

  console.log('\n--- Vite Configuration Diagnostics ---');
  console.log('Current Working Directory (for loadEnv):', process.cwd());
  console.log('Mode:', mode);
  console.log('__dirname (location of vite.config.ts):', __dirname);
  console.log('Resolved alias @  ->', srcAliasPath);
  console.log('Resolved alias @assets ->', assetsAliasPath);

  const testImagePath = path.join(assetsAliasPath, 'images/gmail-icon.svg');
  console.log('Attempting to resolve test image to:', testImagePath);
  if (fs.existsSync(testImagePath)) {
    console.log('SUCCESS: Test image (gmail-icon.svg) found at resolved path.');
  } else {
    console.error('ERROR: Test image (gmail-icon.svg) NOT found at resolved path. Check path and filename casing.');
    console.error('Please verify that this file exists: D:/project/dollarsandlife/frontend/src/assets/images/gmail-icon.svg');
  }
  console.log('--- End Vite Configuration Diagnostics ---\n');
  // --- End Diagnostic Logging ---

  return {
    plugins: [
      react(),
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024,
        filter: /\.(js|mjs|json|css|html|svg|webp)$/i,
        deleteOriginFile: false, // Keep false for dev, consider true for prod
      }),
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
        filter: /\.(js|mjs|json|css|html|svg|webp)$/i,
        deleteOriginFile: false, // Keep false for dev, consider true for prod
      }),
      visualizer({
        filename: 'stats.html', // Output to build/stats.html
        gzipSize: true,
        brotliSize: true,
        open: false,
      }),
    ],
    base: '/',
    publicDir: 'public',
    resolve: {
      alias: {
        '@': srcAliasPath,
        '@assets': assetsAliasPath,
        // You can add more aliases here if needed, e.g.:
        // '@components': path.resolve(__dirname, './src/components'),
        // '@pages': path.resolve(__dirname, './src/pages'),
      },
    },
    build: {
      outDir: 'build',
      sourcemap: mode === 'development', // Consider true for production if needed for debugging
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react-google-recaptcha')) return 'chunk-recaptcha';
              if (id.includes('emailjs-com')) return 'chunk-emailjs';
              if (id.includes('@fortawesome')) return 'chunk-fortawesome';
              if (id.includes('firebase')) return 'chunk-firebase';
              if (id.includes('react-router-dom') || id.includes('react-router')) return 'chunk-router';
              if (id.includes('react') || id.includes('react-dom')) return 'chunk-react';
              return 'chunk-vendor'; // Catch-all for other node_modules
            }
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.name?.split('.').pop()?.toLowerCase();
            if (/\.(png|jpe?g|gif|svg|webp)$/.test(assetInfo.name ?? '')) {
              return 'assets/images/[name]-[hash][extname]';
            }
            if (/\.(css)$/.test(assetInfo.name ?? '')) {
              return 'assets/css/[name]-[hash][extname]';
            }
            return 'assets/other/[name]-[hash][extname]';
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:5000', // Ensure this matches your backend server port
          changeOrigin: true,
        },
      },
    },
    // preview: { // Optional: configure preview server port if needed
    //   port: 4173,
    // },
  };
});