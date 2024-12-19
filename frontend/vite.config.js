import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },  server: {
    host: '0.0.0.0', // Ensure Vite listens on all network interfaces
    port: parseInt(process.env.PORT) || 3000, // Use Railway's PORT or default to 3000
    strictPort: true, // Exit if the port is unavailable
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
})
