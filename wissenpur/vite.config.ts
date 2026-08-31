import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    // Release bundles must not publish source maps unless a future, explicitly
    // reviewed debugging policy introduces a protected upload path.
    sourcemap: false,
  },
  server: {
    // Local agent/preview environments may disable HMR to avoid reload loops
    // while files are being edited. This setting is development-only and is
    // never exposed to the browser bundle.
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
