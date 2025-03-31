import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          solana: ['@solana/web3.js', '@solana/spl-token'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
