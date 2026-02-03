import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  root: 'app',
  publicDir: '../public',
  build: {
    target: 'es2015',
    chunkSizeWarningLimit: 3000,
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    headers: {
      'cross-origin-embedder-policy': 'require-corp',
      'cross-origin-opener-policy': 'same-origin',
    },
  },
  preview: {
    headers: {
      'cross-origin-embedder-policy': 'require-corp',
      'cross-origin-opener-policy': 'same-origin',
    },
  },
  plugins: [react()],
})
