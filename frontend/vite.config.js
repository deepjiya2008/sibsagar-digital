import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// This config forces Vite to use a single version of React
// to prevent "React Element from an older version" errors.

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})