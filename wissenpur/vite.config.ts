import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  define: {
    // App.tsx still uses this legacy check inside the error boundary. Only the
    // non-sensitive build mode is exposed; no API keys are embedded.
    'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // File watching can be disabled there to prevent flickering during agent edits.
    hmr: process.env.DISABLE_HMR !== 'true',
  },
}));
